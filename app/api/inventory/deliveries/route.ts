import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(2).max(200),
  supplier: z.string().max(160).nullable().optional(),
  expectedAt: z.string().datetime().nullable().optional(),
  status: z.enum(["planned", "in_transit", "received", "cancelled"]).default("planned")
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

  const delivery = await prisma.delivery.create({
    data: {
      companyId: user.companyId,
      title: parsed.data.title.trim(),
      supplier: parsed.data.supplier?.trim() || null,
      expectedAt: parsed.data.expectedAt ? new Date(parsed.data.expectedAt) : null,
      status: parsed.data.status
    }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "delivery_created",
      entity: "delivery",
      entityId: delivery.id,
      meta: { title: delivery.title, status: delivery.status }
    }
  });

  return NextResponse.json({ delivery }, { status: 201 });
}
