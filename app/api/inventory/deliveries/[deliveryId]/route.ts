import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(2).max(200).optional(),
  supplier: z.string().max(160).nullable().optional(),
  expectedAt: z.string().datetime().nullable().optional(),
  status: z.enum(["planned", "in_transit", "received", "cancelled"]).optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ deliveryId: string }> }) {
  const user = await requireUser();
  if (!hasPermission(user.role.code, "inventory:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { deliveryId } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const delivery = await prisma.delivery.findFirst({
    where: { id: deliveryId, companyId: user.companyId },
    select: { id: true, title: true }
  });

  if (!delivery) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.delivery.update({
    where: { id: delivery.id },
    data: {
      title: parsed.data.title?.trim(),
      supplier: parsed.data.supplier === undefined ? undefined : parsed.data.supplier?.trim() || null,
      expectedAt: parsed.data.expectedAt === undefined ? undefined : parsed.data.expectedAt ? new Date(parsed.data.expectedAt) : null,
      status: parsed.data.status
    }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "delivery_updated",
      entity: "delivery",
      entityId: delivery.id,
      meta: { from: delivery.title, to: updated.title, status: updated.status }
    }
  });

  return NextResponse.json({ delivery: updated });
}

export async function DELETE(_request: Request, context: { params: Promise<{ deliveryId: string }> }) {
  const user = await requireUser();
  if (!hasPermission(user.role.code, "inventory:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { deliveryId } = await context.params;
  const delivery = await prisma.delivery.findFirst({
    where: { id: deliveryId, companyId: user.companyId },
    select: { id: true, title: true, companyId: true }
  });

  if (!delivery) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.activityLog.create({
      data: {
        companyId: delivery.companyId,
        actorId: user.id,
        action: "delivery_deleted",
        entity: "delivery",
        entityId: delivery.id,
        meta: { title: delivery.title }
      }
    }),
    prisma.delivery.delete({ where: { id: delivery.id } })
  ]);

  return NextResponse.json({ ok: true });
}
