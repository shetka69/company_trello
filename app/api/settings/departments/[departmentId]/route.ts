import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(120)
});

export async function PATCH(request: Request, context: { params: Promise<{ departmentId: string }> }) {
  const user = await requireUser();
  if (!hasUserPermission(user, "users:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { departmentId } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const department = await prisma.department.findFirst({
    where: { id: departmentId, companyId: user.companyId },
    select: { id: true, name: true }
  });

  if (!department) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.department.update({
    where: { id: department.id },
    data: { name: parsed.data.name.trim() }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "department_updated",
      entity: "department",
      entityId: department.id,
      meta: { from: department.name, to: updated.name }
    }
  });

  return NextResponse.json({ department: updated });
}

export async function DELETE(_request: Request, context: { params: Promise<{ departmentId: string }> }) {
  const user = await requireUser();
  if (!hasUserPermission(user, "users:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { departmentId } = await context.params;
  const department = await prisma.department.findFirst({
    where: { id: departmentId, companyId: user.companyId },
    select: { id: true, name: true }
  });

  if (!department) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [users, tasks] = await Promise.all([
    prisma.user.count({ where: { departmentId: department.id } }),
    prisma.task.count({ where: { departmentId: department.id } })
  ]);

  if (users > 0 || tasks > 0) {
    return NextResponse.json({ error: "Department is not empty" }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.activityLog.create({
      data: {
        companyId: user.companyId,
        actorId: user.id,
        action: "department_deleted",
        entity: "department",
        entityId: department.id,
        meta: { name: department.name }
      }
    }),
    prisma.department.delete({ where: { id: department.id } })
  ]);

  return NextResponse.json({ ok: true });
}
