import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasUserPermission, permissions, type Permission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  permission: z.string(),
  enabled: z.boolean()
});

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  const user = await requireUser();
  if (!hasUserPermission(user, "system:develop")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success || !permissions.includes(parsed.data.permission as Permission)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (user.id === userId && (parsed.data.permission === "system:develop" || parsed.data.permission === "users:manage") && !parsed.data.enabled) {
    return NextResponse.json({ error: "Cannot revoke your own admin access" }, { status: 400 });
  }

  const employee = await prisma.user.findFirst({
    where: { id: userId, companyId: user.companyId },
    select: { id: true, role: { select: { code: true } } }
  });

  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.userPermission.upsert({
    where: { userId_permission: { userId: employee.id, permission: parsed.data.permission } },
    create: {
      companyId: user.companyId,
      userId: employee.id,
      permission: parsed.data.permission,
      enabled: parsed.data.enabled
    },
    update: {
      enabled: parsed.data.enabled
    }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "permission_updated",
      entity: "user",
      entityId: employee.id,
      meta: { permission: parsed.data.permission, enabled: parsed.data.enabled }
    }
  });

  return NextResponse.json({ ok: true });
}
