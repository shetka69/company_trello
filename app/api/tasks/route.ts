import { NextResponse } from "next/server";
import { Priority, TaskType } from "@prisma/client";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { taskScopeFor } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";
import { canSeeAllCompanyData, hasPermission } from "@/lib/permissions";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
  departmentId: z.string().optional(),
  dueAt: z.string().datetime().optional(),
  priority: z.nativeEnum(Priority).default(Priority.NORMAL),
  type: z.nativeEnum(TaskType).default(TaskType.PERSONAL)
});

export async function GET() {
  const user = await requireUser();
  const tasks = await prisma.task.findMany({
    where: taskScopeFor(user),
    include: { assignee: true, creator: true, project: true, department: true },
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }]
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!hasPermission(user.role.code, "tasks:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const departmentId = parsed.data.departmentId ?? user.departmentId;
  if (!canSeeAllCompanyData(user.role.code) && departmentId !== user.departmentId) {
    return NextResponse.json({ error: "Forbidden department" }, { status: 403 });
  }

  if (departmentId) {
    const department = await prisma.department.findFirst({
      where: { id: departmentId, companyId: user.companyId },
      select: { id: true }
    });

    if (!department) {
      return NextResponse.json({ error: "Invalid department" }, { status: 400 });
    }
  }

  if (parsed.data.assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: {
        id: parsed.data.assigneeId,
        companyId: user.companyId,
        isActive: true,
        ...(canSeeAllCompanyData(user.role.code) ? {} : { departmentId: user.departmentId })
      },
      select: { id: true }
    });

    if (!assignee) {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
    }
  }

  if (parsed.data.projectId) {
    const project = await prisma.project.findFirst({
      where: {
        id: parsed.data.projectId,
        companyId: user.companyId,
        ...(canSeeAllCompanyData(user.role.code)
          ? {}
          : {
              OR: [
                { members: { some: { userId: user.id } } },
                { tasks: { some: { departmentId: user.departmentId } } }
              ]
            })
      },
      select: { id: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Invalid project" }, { status: 400 });
    }
  }

  const task = await prisma.task.create({
    data: {
      companyId: user.companyId,
      creatorId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      assigneeId: parsed.data.assigneeId,
      projectId: parsed.data.projectId,
      departmentId,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : undefined,
      priority: parsed.data.priority,
      type: parsed.data.type
    }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "task_created",
      entity: "task",
      entityId: task.id,
      meta: { title: task.title }
    }
  });

  return NextResponse.json({ task }, { status: 201 });
}
