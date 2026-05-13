import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createLowStockNotification, resolveLowStockNotification } from "@/lib/notifications";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().positive(),
  comment: z.string().max(500).optional()
});

export async function POST(request: Request, context: { params: Promise<{ deliveryId: string }> }) {
  const user = await requireUser();
  if (!hasPermission(user.role.code, "inventory:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { deliveryId } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const [delivery, item] = await Promise.all([
    prisma.delivery.findFirst({ where: { id: deliveryId, companyId: user.companyId } }),
    prisma.inventoryItem.findFirst({ where: { id: parsed.data.itemId, companyId: user.companyId } })
  ]);

  if (!delivery || !item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedItem = await tx.inventoryItem.update({
      where: { id: item.id },
      data: {
        quantity: { increment: parsed.data.quantity },
        receivedAt: new Date()
      }
    });

    const transaction = await tx.inventoryTransaction.create({
      data: {
        itemId: item.id,
        userId: user.id,
        type: "INCOME",
        quantity: parsed.data.quantity,
        comment: parsed.data.comment?.trim() || `Приемка поставки: ${delivery.title}`
      }
    });

    const updatedDelivery = await tx.delivery.update({
      where: { id: delivery.id },
      data: {
        status: "received",
        receivedAt: new Date()
      }
    });

    await tx.activityLog.create({
      data: {
        companyId: user.companyId,
        actorId: user.id,
        action: "delivery_received",
        entity: "delivery",
        entityId: delivery.id,
        meta: { title: delivery.title, item: item.name, quantity: parsed.data.quantity, unit: item.unit }
      }
    });

    return { updatedItem, transaction, updatedDelivery };
  });

  if (result.updatedItem.quantity <= result.updatedItem.minThreshold) {
    await createLowStockNotification({
      companyId: user.companyId,
      itemId: result.updatedItem.id,
      itemName: result.updatedItem.name,
      quantity: result.updatedItem.quantity,
      unit: result.updatedItem.unit,
      minThreshold: result.updatedItem.minThreshold
    });
  } else {
    await resolveLowStockNotification({
      companyId: user.companyId,
      itemId: result.updatedItem.id
    });
  }

  return NextResponse.json({ delivery: result.updatedDelivery, item: result.updatedItem, transaction: result.transaction });
}
