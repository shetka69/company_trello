import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(200).optional(),
  category: z.string().min(2).max(120).optional(),
  unit: z.string().min(1).max(30).optional(),
  minThreshold: z.number().int().min(0).optional(),
  responsibleId: z.string().nullable().optional(),
  comments: z.string().nullable().optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ itemId: string }> }) {
  const user = await requireUser();
  if (!hasUserPermission(user, "inventory:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { itemId } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const item = await prisma.inventoryItem.findFirst({
    where: { id: itemId, companyId: user.companyId },
    select: { id: true, name: true }
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.responsibleId) {
    const responsible = await prisma.user.findFirst({
      where: { id: parsed.data.responsibleId, companyId: user.companyId, isActive: true },
      select: { id: true }
    });

    if (!responsible) {
      return NextResponse.json({ error: "Invalid responsible user" }, { status: 400 });
    }
  }

  const updated = await prisma.inventoryItem.update({
    where: { id: item.id },
    data: {
      name: parsed.data.name?.trim(),
      category: parsed.data.category?.trim(),
      unit: parsed.data.unit?.trim(),
      minThreshold: parsed.data.minThreshold,
      responsibleId: parsed.data.responsibleId,
      comments: parsed.data.comments === undefined ? undefined : parsed.data.comments?.trim() || null
    }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "inventory_item_updated",
      entity: "inventory_item",
      entityId: item.id,
      meta: { from: item.name, to: updated.name }
    }
  });

  return NextResponse.json({ item: updated });
}

export async function DELETE(_request: Request, context: { params: Promise<{ itemId: string }> }) {
  const user = await requireUser();
  if (!hasUserPermission(user, "inventory:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { itemId } = await context.params;
  const item = await prisma.inventoryItem.findFirst({
    where: { id: itemId, companyId: user.companyId },
    select: { id: true, name: true, companyId: true, quantity: true, unit: true }
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.activityLog.create({
      data: {
        companyId: item.companyId,
        actorId: user.id,
        action: "inventory_item_deleted",
        entity: "inventory_item",
        entityId: item.id,
        meta: { name: item.name, quantity: item.quantity, unit: item.unit }
      }
    }),
    prisma.inventoryItem.delete({
      where: { id: item.id }
    })
  ]);

  return NextResponse.json({ ok: true });
}
