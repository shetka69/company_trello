import { NextResponse } from "next/server";
import { InventoryTransactionType } from "@prisma/client";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createLowStockNotification, resolveLowStockNotification } from "@/lib/notifications";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  itemId: z.string().min(1),
  type: z.nativeEnum(InventoryTransactionType),
  quantity: z.number().int().positive(),
  comment: z.string().optional()
});

class InsufficientStockError extends Error {}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!hasUserPermission(user, "inventory:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const item = await prisma.inventoryItem.findFirst({
    where: { id: parsed.data.itemId, companyId: user.companyId }
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let result;
  try {
    result = await prisma.$transaction(async (tx) => {
      const currentItem = await tx.inventoryItem.findFirstOrThrow({
        where: { id: item.id, companyId: user.companyId }
      });

      const updateData =
        parsed.data.type === "INCOME"
          ? { quantity: { increment: parsed.data.quantity } }
          : parsed.data.type === "ADJUSTMENT"
            ? { quantity: parsed.data.quantity }
            : { quantity: { decrement: parsed.data.quantity } };

      if (parsed.data.type === "WRITE_OFF" || parsed.data.type === "PICKUP") {
        const updated = await tx.inventoryItem.updateMany({
          where: {
            id: item.id,
            companyId: user.companyId,
            quantity: { gte: parsed.data.quantity }
          },
          data: updateData
        });

        if (updated.count === 0) {
          throw new InsufficientStockError("Quantity cannot be negative");
        }
      } else {
        await tx.inventoryItem.update({
          where: { id: item.id },
          data: updateData
        });
      }

      const updatedItem = await tx.inventoryItem.findFirstOrThrow({
        where: { id: item.id, companyId: user.companyId }
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          itemId: item.id,
          userId: user.id,
          type: parsed.data.type,
          quantity: parsed.data.quantity,
          comment: parsed.data.comment
        }
      });

      await tx.activityLog.create({
        data: {
          companyId: user.companyId,
          actorId: user.id,
          action: "inventory_transaction",
          entity: "inventory_item",
          entityId: item.id,
          meta: { type: parsed.data.type, quantity: parsed.data.quantity, from: currentItem.quantity, to: updatedItem.quantity }
        }
      });

      return { transaction, updatedItem };
    });
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    throw error;
  }

  const { transaction, updatedItem } = result;

  if (updatedItem.quantity <= updatedItem.minThreshold) {
    await createLowStockNotification({
      companyId: user.companyId,
      itemId: updatedItem.id,
      itemName: updatedItem.name,
      quantity: updatedItem.quantity,
      unit: updatedItem.unit,
      minThreshold: updatedItem.minThreshold
    });
  } else {
    await resolveLowStockNotification({
      companyId: user.companyId,
      itemId: updatedItem.id
    });
  }

  return NextResponse.json({ transaction, item: updatedItem }, { status: 201 });
}
