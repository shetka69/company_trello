import "server-only";

import type { CurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRealtimeVersion } from "@/lib/realtime-bus";

export async function getRealtimeVersion(user: CurrentUser) {
  const [state, unreadCount] = await Promise.all([
    getRealtimeState(user.companyId),
    prisma.notification.count({
      where: {
        companyId: user.companyId,
        OR: [{ userId: user.id }, { userId: null }],
        readAt: null,
      },
    }),
  ]);

  return {
    version: formatVersion(state.version, state.updatedAt),
    latest: state.updatedAt.getTime(),
    unreadCount,
  };
}

export async function getRealtimeMarker(user: CurrentUser) {
  const state = await getRealtimeState(user.companyId);

  return {
    version: formatVersion(state.version, state.updatedAt),
    latest: state.updatedAt.getTime(),
  };
}

async function getRealtimeState(companyId: string) {
  const existing = await prisma.realtimeState.findUnique({
    where: { companyId },
    select: { version: true, updatedAt: true },
  });

  if (existing) return existing;

  return prisma.realtimeState.create({
    data: { companyId },
    select: { version: true, updatedAt: true },
  });
}

const formatVersion = formatRealtimeVersion;
