import "server-only";

import { prisma } from "@/lib/prisma";

export async function markOverdueTasks(companyId: string) {
  const now = new Date();

  const overdueTask = await prisma.task.findFirst({
    where: {
      companyId,
      dueAt: { lt: now },
      status: { notIn: ["DONE", "OVERDUE"] }
    },
    select: { id: true }
  });

  if (!overdueTask) return;

  await prisma.task.updateMany({
    where: {
      companyId,
      dueAt: { lt: now },
      status: { notIn: ["DONE", "OVERDUE"] }
    },
    data: {
      status: "OVERDUE"
    }
  });
}
