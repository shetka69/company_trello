import "server-only";

type RealtimePayload = {
  version: string;
};

type RealtimeListener = (payload: RealtimePayload) => void;

const globalForRealtime = globalThis as unknown as {
  realtimeListeners?: Map<string, Set<RealtimeListener>>;
};

const listeners =
  globalForRealtime.realtimeListeners ?? new Map<string, Set<RealtimeListener>>();

globalForRealtime.realtimeListeners = listeners;

export function subscribeRealtime(companyId: string, listener: RealtimeListener) {
  const companyListeners = listeners.get(companyId) ?? new Set<RealtimeListener>();
  companyListeners.add(listener);
  listeners.set(companyId, companyListeners);

  return () => {
    companyListeners.delete(listener);
    if (companyListeners.size === 0) {
      listeners.delete(companyId);
    }
  };
}

export function publishRealtime(companyId: string, payload: RealtimePayload) {
  const companyListeners = listeners.get(companyId);
  if (!companyListeners) return;

  for (const listener of companyListeners) {
    listener(payload);
  }
}

export function formatRealtimeVersion(version: bigint, updatedAt: Date) {
  return `${version.toString()}:${updatedAt.getTime()}`;
}
