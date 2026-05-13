import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2).max(120)
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

  const department = await prisma.department.create({
    data: {
      companyId: user.companyId,
      name: parsed.data.name.trim()
    }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "department_created",
      entity: "department",
      entityId: department.id,
      meta: { name: department.name }
    }
  });

  return NextResponse.json({ department }, { status: 201 });
}
