import { NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(160).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  roleCode: z.nativeEnum(RoleCode).optional(),
  departmentId: z.string().nullable().optional(),
  telegramChatId: z.string().nullable().optional(),
  isActive: z.boolean().optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  const user = await requireUser();
  if (!hasUserPermission(user, "users:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const employee = await prisma.user.findFirst({
    where: { id: userId, companyId: user.companyId },
    include: { role: true }
  });

  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (employee.id === user.id && parsed.data.isActive === false) {
    return NextResponse.json({ error: "Cannot disable yourself" }, { status: 400 });
  }

  let roleId: string | undefined;
  if (parsed.data.roleCode) {
    const role = await prisma.role.findUnique({
      where: { companyId_code: { companyId: user.companyId, code: parsed.data.roleCode } },
      select: { id: true }
    });

    if (!role) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    roleId = role.id;
  }

  if (parsed.data.departmentId) {
    const department = await prisma.department.findFirst({
      where: { id: parsed.data.departmentId, companyId: user.companyId },
      select: { id: true }
    });

    if (!department) {
      return NextResponse.json({ error: "Invalid department" }, { status: 400 });
    }
  }

  const passwordHash = parsed.data.password ? await bcrypt.hash(parsed.data.password, 10) : undefined;

  try {
    const updated = await prisma.user.update({
      where: { id: employee.id },
      data: {
        name: parsed.data.name?.trim(),
        email: parsed.data.email?.trim().toLowerCase(),
        passwordHash,
        roleId,
        departmentId: parsed.data.departmentId,
        telegramChatId: parsed.data.telegramChatId === undefined ? undefined : parsed.data.telegramChatId?.trim() || null,
        isActive: parsed.data.isActive
      },
      include: { role: true, department: true }
    });

    await prisma.activityLog.create({
      data: {
        companyId: user.companyId,
        actorId: user.id,
        action: "user_updated",
        entity: "user",
        entityId: employee.id,
        meta: { email: updated.email }
      }
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ userId: string }> }) {
  const user = await requireUser();
  if (!hasUserPermission(user, "users:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await context.params;
  const employee = await prisma.user.findFirst({
    where: { id: userId, companyId: user.companyId },
    select: { id: true, email: true, isActive: true }
  });

  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (employee.id === user.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: employee.id },
    data: { isActive: false },
    select: { id: true, email: true, isActive: true }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "user_deleted",
      entity: "user",
      entityId: employee.id,
      meta: { email: employee.email, mode: "soft_delete" }
    }
  });

  return NextResponse.json({ user: updated });
}
