import "server-only";

import type { CurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getRealtimeVersion(user: CurrentUser) {
  const companyId = user.companyId;

  const [
    company,
    departments,
    roles,
    users,
    permissions,
    projects,
    tasks,
    taskComments,
    taskChecklist,
    taskAttachments,
    taskHistory,
    calendarEvents,
    inventoryItems,
    inventoryTransactions,
    deliveries,
    qrPresets,
    qrCodes,
    notifications,
    logs,
    counts
  ] = await Promise.all([
    prisma.company.aggregate({ where: { id: companyId }, _max: { updatedAt: true } }),
    prisma.department.aggregate({ where: { companyId }, _max: { createdAt: true } }),
    prisma.role.aggregate({ where: { companyId }, _max: { createdAt: true } }),
    prisma.user.aggregate({ where: { companyId }, _max: { updatedAt: true } }),
    prisma.userPermission.aggregate({ where: { companyId }, _max: { updatedAt: true } }),
    prisma.project.aggregate({ where: { companyId }, _max: { updatedAt: true } }),
    prisma.task.aggregate({ where: { companyId }, _max: { updatedAt: true } }),
    prisma.taskComment.aggregate({ where: { task: { companyId } }, _max: { createdAt: true } }),
    prisma.taskChecklistItem.aggregate({ where: { task: { companyId } }, _max: { createdAt: true } }),
    prisma.taskAttachment.aggregate({ where: { task: { companyId } }, _max: { createdAt: true } }),
    prisma.taskHistory.aggregate({ where: { task: { companyId } }, _max: { createdAt: true } }),
    prisma.calendarEvent.aggregate({ where: { companyId }, _max: { updatedAt: true } }),
    prisma.inventoryItem.aggregate({ where: { companyId }, _max: { updatedAt: true } }),
    prisma.inventoryTransaction.aggregate({ where: { item: { companyId } }, _max: { createdAt: true } }),
    prisma.delivery.aggregate({ where: { companyId }, _max: { createdAt: true, receivedAt: true } }),
    prisma.qrProductPreset.aggregate({ where: { companyId }, _max: { updatedAt: true } }),
    prisma.productQrCode.aggregate({ where: { companyId }, _max: { updatedAt: true } }),
    prisma.notification.aggregate({
      where: { companyId, OR: [{ userId: user.id }, { userId: null }] },
      _max: { createdAt: true, readAt: true }
    }),
    prisma.activityLog.aggregate({ where: { companyId }, _max: { createdAt: true } }),
    Promise.all([
      prisma.task.count({ where: { companyId } }),
      prisma.calendarEvent.count({ where: { companyId } }),
      prisma.inventoryItem.count({ where: { companyId } }),
      prisma.delivery.count({ where: { companyId } }),
      prisma.notification.count({ where: { companyId, OR: [{ userId: user.id }, { userId: null }] } }),
      prisma.notification.count({ where: { companyId, OR: [{ userId: user.id }, { userId: null }], readAt: null } }),
      prisma.department.count({ where: { companyId } }),
      prisma.role.count({ where: { companyId } }),
      prisma.user.count({ where: { companyId } }),
      prisma.project.count({ where: { companyId } }),
      prisma.projectMember.count({ where: { project: { companyId } } }),
      prisma.taskComment.count({ where: { task: { companyId } } }),
      prisma.taskChecklistItem.count({ where: { task: { companyId } } }),
      prisma.inventoryTransaction.count({ where: { item: { companyId } } }),
      prisma.qrProductPreset.count({ where: { companyId } }),
      prisma.productQrCode.count({ where: { companyId } }),
      prisma.activityLog.count({ where: { companyId } })
    ])
  ]);

  const latest = Math.max(
    timestamp(company._max.updatedAt),
    timestamp(departments._max.createdAt),
    timestamp(roles._max.createdAt),
    timestamp(users._max.updatedAt),
    timestamp(permissions._max.updatedAt),
    timestamp(projects._max.updatedAt),
    timestamp(tasks._max.updatedAt),
    timestamp(taskComments._max.createdAt),
    timestamp(taskChecklist._max.createdAt),
    timestamp(taskAttachments._max.createdAt),
    timestamp(taskHistory._max.createdAt),
    timestamp(calendarEvents._max.updatedAt),
    timestamp(inventoryItems._max.updatedAt),
    timestamp(inventoryTransactions._max.createdAt),
    timestamp(deliveries._max.createdAt),
    timestamp(deliveries._max.receivedAt),
    timestamp(qrPresets._max.updatedAt),
    timestamp(qrCodes._max.updatedAt),
    timestamp(notifications._max.createdAt),
    timestamp(notifications._max.readAt),
    timestamp(logs._max.createdAt)
  );

  return {
    version: [latest, ...counts].join(":"),
    latest,
    unreadCount: counts[5]
  };
}

function timestamp(value: Date | null | undefined) {
  return value?.getTime() ?? 0;
}
