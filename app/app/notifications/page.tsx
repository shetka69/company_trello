import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NotificationReadAllButton, NotificationReadButton } from "@/components/notifications/notification-actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

const priorityLabels = {
  NORMAL: "Обычное",
  IMPORTANT: "Важное",
  CRITICAL: "Критичное"
};

const channelLabels = {
  INTERNAL: "Внутреннее",
  TELEGRAM: "Telegram",
  PUSH: "Push"
};

function variant(priority: keyof typeof priorityLabels) {
  if (priority === "CRITICAL") return "red" as const;
  if (priority === "IMPORTANT") return "amber" as const;
  return "neutral" as const;
}

function notificationHref(meta: unknown) {
  if (!meta || typeof meta !== "object") return null;
  const record = meta as Record<string, unknown>;

  if (typeof record.itemId === "string") {
    return "/app/inventory";
  }

  if (typeof record.taskId === "string") {
    return `/app/tasks/${record.taskId}`;
  }

  return null;
}

export default async function NotificationsPage({
  searchParams
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const filter = params?.filter === "all" ? "all" : "unread";
  const baseWhere = {
    companyId: user.companyId,
    OR: [{ userId: user.id }, { userId: null }]
  };

  const [notifications, unreadCount, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        ...baseWhere,
        ...(filter === "unread" ? { readAt: null } : {})
      },
      orderBy: { createdAt: "desc" },
      take: 50
    }),
    prisma.notification.count({
      where: {
        ...baseWhere,
        readAt: null
      }
    }),
    prisma.notification.count({ where: baseWhere })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Уведомления</h1>
          <p className="mt-1 text-sm text-muted">Внутренние сигналы, критичные остатки и будущие каналы доставки</p>
        </div>
        <NotificationReadAllButton disabled={unreadCount === 0} />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterLink href="/app/notifications" active={filter === "unread"}>
          Непрочитанные · {unreadCount}
        </FilterLink>
        <FilterLink href="/app/notifications?filter=all" active={filter === "all"}>
          Все · {totalCount}
        </FilterLink>
      </div>

      <Card>
        <div className="space-y-3">
          {notifications.length === 0 && <p className="text-sm text-muted">Уведомлений пока нет.</p>}
          {notifications.map((notification) => {
            const href = notificationHref(notification.meta);
            return (
              <div
                key={notification.id}
                className={`rounded-lg border p-4 ${notification.readAt ? "border-stroke bg-surface/70" : "border-brand/40 bg-surface"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{notification.title}</div>
                    <div className="mt-1 text-sm leading-6 text-muted">{notification.body}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={variant(notification.priority)}>{priorityLabels[notification.priority]}</Badge>
                    {!notification.readAt && <Badge variant="green">Новое</Badge>}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
                  <div>
                    {channelLabels[notification.channel]} · {notification.readAt ? "Прочитано" : "Не прочитано"} · {formatDate(notification.createdAt)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {href && (
                      <Link href={href} className="inline-flex h-9 items-center rounded-md border border-stroke px-3 text-sm font-medium transition hover:text-text">
                        Открыть
                      </Link>
                    )}
                    {!notification.readAt && <NotificationReadButton notificationId={notification.id} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
        active ? "border-brand bg-brand/10 text-emerald-100" : "border-stroke text-muted hover:text-text"
      }`}
    >
      {children}
    </Link>
  );
}
