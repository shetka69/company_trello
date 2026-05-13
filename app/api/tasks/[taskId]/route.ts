import { NextResponse } from "next/server";
import { Priority, TaskStatus, TaskType } from "@prisma/client";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { taskScopeFor } from "@/lib/data-scope";
import { canSeeAllCompanyData, hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  type: z.nativeEnum(TaskType).optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ taskId: string }> }) {
  const user = await requireUser();
  if (!hasPermission(user.role.code, "tasks:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { taskId } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, ...taskScopeFor(user) }
  });

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const companyWide = canSeeAllCompanyData(user.role.code);
  const departmentId = parsed.data.departmentId === undefined ? task.departmentId : parsed.data.departmentId;

  if (!companyWide && departmentId !== user.departmentId) {
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
        ...(companyWide ? {} : { departmentId: user.departmentId })
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
        ...(companyWide
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

  const updateData = {
    title: parsed.data.title,
    description: parsed.data.description,
    assigneeId: parsed.data.assigneeId,
    projectId: parsed.data.projectId,
    departmentId,
    dueAt: parsed.data.dueAt === undefined ? undefined : parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
    priority: parsed.data.priority,
    status: parsed.data.status,
    type: parsed.data.type
  };

  const changes = [
    historyChange("title", task.title, updateData.title),
    historyChange("description", task.description, updateData.description),
    historyChange("assigneeId", task.assigneeId, updateData.assigneeId),
    historyChange("projectId", task.projectId, updateData.projectId),
    historyChange("departmentId", task.departmentId, updateData.departmentId),
    historyChange("dueAt", task.dueAt?.toISOString() ?? null, updateData.dueAt?.toISOString() ?? updateData.dueAt),
    historyChange("priority", task.priority, updateData.priority),
    historyChange("status", task.status, updateData.status),
    historyChange("type", task.type, updateData.type)
  ].filter((change): change is { field: string; oldValue: string | null; newValue: string | null } => Boolean(change));

  const updated = await prisma.$transaction(async (tx) => {
    const updatedTask = await tx.task.update({
      where: { id: task.id },
      data: updateData
    });

    if (changes.length > 0) {
      await tx.taskHistory.createMany({
        data: changes.map((change) => ({
          taskId: task.id,
          userId: user.id,
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue
        }))
      });

      await tx.activityLog.create({
        data: {
          companyId: user.companyId,
          actorId: user.id,
          action: "task_updated",
          entity: "task",
          entityId: task.id,
          meta: { fields: changes.map((change) => change.field) }
        }
      });
    }

    return updatedTask;
  });

  return NextResponse.json({ task: updated });
}

export async function DELETE(_request: Request, context: { params: Promise<{ taskId: string }> }) {
  const user = await requireUser();
  if (!hasPermission(user.role.code, "tasks:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { taskId } = await context.params;
  const task = await prisma.task.findFirst({
    where: { id: taskId, ...taskScopeFor(user) },
    select: { id: true, title: true, companyId: true }
  });

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.activityLog.create({
      data: {
        companyId: task.companyId,
        actorId: user.id,
        action: "task_deleted",
        entity: "task",
        entityId: task.id,
        meta: { title: task.title }
      }
    }),
    prisma.task.delete({
      where: { id: task.id }
    })
  ]);

  return NextResponse.json({ ok: true });
}

function historyChange(field: string, oldValue: unknown, newValue: unknown) {
  if (newValue === undefined) return null;

  const normalizedOld = normalizeHistoryValue(oldValue);
  const normalizedNew = normalizeHistoryValue(newValue);

  if (normalizedOld === normalizedNew) return null;

  return {
    field,
    oldValue: normalizedOld,
    newValue: normalizedNew
  };
}

function normalizeHistoryValue(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}
