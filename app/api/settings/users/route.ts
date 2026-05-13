import { NextResponse } from "next/server";
import { RoleCode } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(160),
  email: z.string().email(),
  password: z.string().min(8),
  roleCode: z.nativeEnum(RoleCode),
  departmentId: z.string().nullable().optional(),
  telegramChatId: z.string().nullable().optional()
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!hasPermission(user.role.code, "users:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const role = await prisma.role.findUnique({
    where: { companyId_code: { companyId: user.companyId, code: parsed.data.roleCode } },
    select: { id: true }
  });

  if (!role) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
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

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    const employee = await prisma.user.create({
      data: {
        companyId: user.companyId,
        name: parsed.data.name.trim(),
        email: parsed.data.email.trim().toLowerCase(),
        passwordHash,
        roleId: role.id,
        departmentId: parsed.data.departmentId || null,
        telegramChatId: parsed.data.telegramChatId?.trim() || null
      },
      include: { role: true, department: true }
    });

    await prisma.activityLog.create({
      data: {
        companyId: user.companyId,
        actorId: user.id,
        action: "user_created",
        entity: "user",
        entityId: employee.id,
        meta: { email: employee.email }
      }
    });

    return NextResponse.json({ user: employee }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }
}
