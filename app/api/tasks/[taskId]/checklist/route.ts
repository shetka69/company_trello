import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { taskScopeFor } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1).max(300)
});

const updateSchema = z.object({
  itemId: z.string().min(1),
  done: z.boolean()
});

export async function POST(request: Request, context: { params: Promise<{ taskId: string }> }) {
  const user = await requireUser();
  const { taskId } = await context.params;
  const parsed = createSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, ...taskScopeFor(user) },
    select: { id: true }
  });

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const item = await prisma.taskChecklistItem.create({
    data: {
      taskId: task.id,
      ownerId: user.id,
      title: parsed.data.title.trim()
    }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "task_checklist_added",
      entity: "task",
      entityId: task.id,
      meta: { itemId: item.id }
    }
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request: Request, context: { params: Promise<{ taskId: string }> }) {
  const user = await requireUser();
  const { taskId } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const item = await prisma.taskChecklistItem.findFirst({
    where: {
      id: parsed.data.itemId,
      taskId,
      task: taskScopeFor(user)
    },
    select: { id: true, taskId: true, done: true }
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.taskChecklistItem.update({
    where: { id: item.id },
    data: { done: parsed.data.done }
  });

  await prisma.taskHistory.create({
    data: {
      taskId: item.taskId,
      userId: user.id,
      field: "checklist",
      oldValue: item.done ? "done" : "open",
      newValue: parsed.data.done ? "done" : "open"
    }
  });

  return NextResponse.json({ item: updated });
}
