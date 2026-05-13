import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { taskScopeFor } from "@/lib/data-scope";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  body: z.string().min(1).max(2000)
});

export async function POST(request: Request, context: { params: Promise<{ taskId: string }> }) {
  const user = await requireUser();
  const { taskId } = await context.params;
  const parsed = schema.safeParse(await request.json());

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

  const comment = await prisma.taskComment.create({
    data: {
      taskId: task.id,
      authorId: user.id,
      body: parsed.data.body.trim()
    },
    include: { author: { select: { name: true } } }
  });

  await prisma.activityLog.create({
    data: {
      companyId: user.companyId,
      actorId: user.id,
      action: "task_comment_added",
      entity: "task",
      entityId: task.id
    }
  });

  return NextResponse.json({ comment }, { status: 201 });
}
