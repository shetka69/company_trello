import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(200),
  category: z.string().min(2).max(120),
  quantity: z.number().int().min(0).default(0),
  unit: z.string().min(1).max(30),
  minThreshold: z.number().int().min(0).default(0),
  responsibleId: z.string().nullable().optional(),
  comments: z.string().nullable().optional()
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!hasUserPermission(user, "inventory:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
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

  const item = await prisma.inventoryItem.create({
    data: {
      companyId: user.companyId,
      name: parsed.data.name.trim(),
      category: parsed.data.category.trim(),
      quantity: parsed.data.quantity,
      unit: parsed.data.unit.trim(),
      minThreshold: parsed.data.minThreshold,
      responsibleId: parsed.data.responsibleId || null,
      comments: parsed.data.comments?.trim() || null,
      receivedAt: parsed.data.quantity > 0 ? new Date() : null
    }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "inventory_item_created",
      entity: "inventory_item",
      entityId: item.id,
      meta: { name: item.name, quantity: item.quantity, unit: item.unit }
    }
  });

  return NextResponse.json({ item }, { status: 201 });
}
