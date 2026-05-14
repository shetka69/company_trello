import { NextResponse } from "next/server";
import { TaskStatus } from "@prisma/client";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { taskScopeFor } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";
import { hasUserPermission } from "@/lib/permissions";

const schema = z.object({
  taskId: z.string().min(1),
  status: z.nativeEnum(TaskStatus)
});

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!hasUserPermission(user, "tasks:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const task = await prisma.task.findFirst({
    where: {
      id: parsed.data.taskId,
      ...taskScopeFor(user)
    }
  });

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canManage = hasUserPermission(user, "tasks:manage");
  const canUpdateOwn = task.assigneeId === user.id || task.creatorId === user.id;
  if (!canManage && !canUpdateOwn) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: { status: parsed.data.status }
  });

  await prisma.taskHistory.create({
    data: {
      taskId: task.id,
      userId: user.id,
      field: "status",
      oldValue: task.status,
      newValue: parsed.data.status
    }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "task_status_changed",
      entity: "task",
      entityId: task.id,
      meta: { from: task.status, to: parsed.data.status }
    }
  });

  return NextResponse.json({ task: updated });
}
