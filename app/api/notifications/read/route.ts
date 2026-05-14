import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  notificationId: z.string().min(1).optional(),
  all: z.boolean().optional()
});

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!hasUserPermission(user, "notifications:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.all) {
    await prisma.notification.updateMany({
      where: {
        companyId: user.companyId,
        OR: [{ userId: user.id }, { userId: null }],
        readAt: null
      },
      data: { readAt: new Date() }
    });
  } else {
    if (!parsed.data.notificationId) {
      return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
    }

    await prisma.notification.updateMany({
      where: {
        id: parsed.data.notificationId,
        companyId: user.companyId,
        OR: [{ userId: user.id }, { userId: null }]
      },
      data: { readAt: new Date() }
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if (!hasUserPermission(user, "notifications:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.pick({ notificationId: true }).safeParse(await request.json());
  if (!parsed.success || !parsed.data.notificationId) {
    return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
  }

  await prisma.notification.deleteMany({
    where: {
      id: parsed.data.notificationId,
      companyId: user.companyId,
      OR: [{ userId: user.id }, { userId: null }],
      readAt: { not: null }
    }
  });

  return NextResponse.json({ ok: true });
}
