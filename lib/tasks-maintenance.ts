import "server-only";

import { prisma } from "@/lib/prisma";

export async function markOverdueTasks(companyId: string) {
  const now = new Date();

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
