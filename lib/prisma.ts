import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { formatRealtimeVersion, publishRealtime } from "@/lib/realtime-bus";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  realtimeMiddlewareInstalled?: boolean;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

const realtimeModels = new Set([
  "ActivityLog",
  "CalendarEvent",
  "Company",
  "Delivery",
  "Department",
  "InventoryItem",
  "InventoryTransaction",
  "Notification",
  "ProductQrCode",
  "Project",
  "ProjectMember",
  "QrProductPreset",
  "Role",
  "Task",
  "TaskAttachment",
  "TaskChecklistItem",
  "TaskComment",
  "TaskHistory",
  "User",
  "UserPermission",
]);

const realtimeActions = new Set([
  "create",
  "createMany",
  "update",
  "updateMany",
  "upsert",
  "delete",
  "deleteMany",
]);

if (!globalForPrisma.realtimeMiddlewareInstalled) {
  prisma.$use(async (params, next) => {
    const result = await next(params);

    if (
      params.model &&
      realtimeModels.has(params.model) &&
      realtimeActions.has(params.action) &&
      hasChangedRows(params.action, result)
    ) {
      const companyIds = extractCompanyIds(params.args, result);

      const updates = await Promise.all(
        [...companyIds].map(async (companyId) => {
          const state = await prisma.realtimeState.upsert({
            where: { companyId },
            update: { version: { increment: 1 } },
            create: { companyId, version: 1 },
            select: { version: true, updatedAt: true },
          });

          return { companyId, state };
        })
      );

      for (const update of updates) {
        publishRealtime(update.companyId, {
          version: formatRealtimeVersion(update.state.version, update.state.updatedAt),
        });
      }
    }

    return result;
  });

  globalForPrisma.realtimeMiddlewareInstalled = true;
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function extractCompanyIds(args: Prisma.MiddlewareParams["args"], result: unknown) {
  const ids = new Set<string>();

  collectCompanyIds(args, ids);
  collectCompanyIds(result, ids);

  return ids;
}

function hasChangedRows(action: string, result: unknown) {
  if (!["createMany", "updateMany", "deleteMany"].includes(action)) return true;
  if (!result || typeof result !== "object") return true;

  const count = (result as { count?: unknown }).count;
  return typeof count !== "number" || count > 0;
}

function collectCompanyIds(value: unknown, ids: Set<string>) {
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    value.forEach((item) => collectCompanyIds(item, ids));
    return;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.companyId === "string") {
    ids.add(record.companyId);
  }

  for (const key of ["data", "where"]) {
    collectCompanyIds(record[key], ids);
  }
}
