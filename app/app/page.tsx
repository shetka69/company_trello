import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requirePermission, requireUser } from "@/lib/auth";
import { taskScopeFor } from "@/lib/data-scope";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { markOverdueTasks } from "@/lib/tasks-maintenance";
import { formatDate } from "@/lib/utils";
import { deletedUserLabel } from "@/lib/deleted-user";

export default async function DashboardPage() {
  const user = await requireUser();
  requirePermission(user, "dashboard:read");
  await markOverdueTasks(user.companyId);
  const now = new Date();
  const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24);
  const canReadInventory = hasUserPermission(user, "inventory:read");
  const canReadAudit = hasUserPermission(user, "audit:read");
  const canReadCalendar = hasUserPermission(user, "calendar:read");

  const [todayTasks, overdueTasks, events, deadlineTasks, deliveries, criticalNotifications, lowStock, logs] = await Promise.all([
    prisma.task.findMany({
      where: { ...taskScopeFor(user), dueAt: { gte: now, lte: tomorrow } },
      include: { assignee: true },
      take: 6,
      orderBy: { dueAt: "asc" }
    }),
    prisma.task.findMany({
      where: { ...taskScopeFor(user), dueAt: { lt: now }, status: { not: "DONE" } },
      include: { assignee: true },
      take: 6,
      orderBy: { dueAt: "asc" }
    }),
    canReadCalendar
      ? prisma.calendarEvent.findMany({
          where: { companyId: user.companyId, startsAt: { gte: now }, type: { in: ["EVENT", "REMINDER"] } },
          take: 5,
          orderBy: { startsAt: "asc" }
        })
      : [],
    canReadCalendar
      ? prisma.task.findMany({
          where: { ...taskScopeFor(user), dueAt: { gte: now } },
          select: { id: true, title: true, dueAt: true },
          take: 5,
          orderBy: { dueAt: "asc" }
        })
      : [],
    canReadCalendar && canReadInventory
      ? prisma.delivery.findMany({
          where: { companyId: user.companyId, expectedAt: { gte: now } },
          take: 5,
          orderBy: { expectedAt: "asc" }
        })
      : [],
    prisma.notification.findMany({
      where: { companyId: user.companyId, OR: [{ userId: user.id }, { userId: null }], priority: "CRITICAL", readAt: null },
      take: 5,
      orderBy: { createdAt: "desc" }
    }),
    canReadInventory
      ? prisma.inventoryItem.findMany({
          where: { companyId: user.companyId },
          take: 5,
          orderBy: { quantity: "asc" }
        })
      : [],
    canReadAudit
      ? prisma.activityLog.findMany({
          where: { companyId: user.companyId },
          include: { actor: true },
          take: 8,
          orderBy: { createdAt: "desc" }
        })
      : []
  ]);

  const filteredLowStock = lowStock.filter((item) => item.quantity <= item.minThreshold);
  const upcomingCalendarItems = [
    ...events.map((event) => ({ date: event.startsAt, title: event.title, meta: formatDate(event.startsAt), href: "/app/calendar" })),
    ...deadlineTasks.map((task) => ({ date: task.dueAt ?? now, title: task.title, meta: `Дедлайн задачи · ${formatDate(task.dueAt)}`, href: `/app/tasks/${task.id}` })),
    ...deliveries.map((delivery) => ({ date: delivery.expectedAt ?? now, title: delivery.title, meta: `Поставка · ${formatDate(delivery.expectedAt)}`, href: "/app/inventory" }))
  ]
    .sort((left, right) => left.date.getTime() - right.date.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Главная панель</h1>
        <p className="mt-1 text-sm text-muted">Оперативная картина задач, календаря, уведомлений и склада</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/app/tasks"><Card><Metric label="Задачи сегодня" value={todayTasks.length} /></Card></Link>
        <Link href="/app/tasks"><Card><Metric label="Просрочено" value={overdueTasks.length} danger /></Card></Link>
        <Link href="/app/notifications"><Card><Metric label="Критические уведомления" value={criticalNotifications.length} danger /></Card></Link>
        {canReadInventory && <Link href="/app/inventory"><Card><Metric label="Низкий остаток" value={filteredLowStock.length} /></Card></Link>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Задачи на сегодня" />
          <List items={todayTasks.map((task) => ({ title: task.title, meta: `${formatDate(task.dueAt)} · ${task.assignee?.name ?? deletedUserLabel(task.assigneeNameSnapshot)}`, href: `/app/tasks/${task.id}` }))} />
        </Card>
        <Card>
          <SectionTitle title="Критические события" />
          <List
            items={[
              ...criticalNotifications.map((notification) => ({ title: notification.title, meta: notification.body, href: "/app/notifications" })),
              ...overdueTasks.map((task) => ({ title: task.title, meta: `Просрочено: ${formatDate(task.dueAt)}`, href: `/app/tasks/${task.id}` }))
            ]}
          />
        </Card>
        {canReadCalendar && (
          <Card>
            <SectionTitle title="Календарь" />
            <List items={upcomingCalendarItems.map((event) => ({ title: event.title, meta: event.meta, href: event.href }))} />
          </Card>
        )}
        {canReadInventory && (
          <Card>
            <SectionTitle title="Склад" />
            <div className="space-y-3">
              {filteredLowStock.length === 0 && <p className="text-sm text-muted">Нет критичных остатков</p>}
              {filteredLowStock.map((item) => (
                <Link key={item.id} href="/app/inventory" className="flex items-center justify-between rounded-md bg-surface p-3 transition hover:bg-panelSoft">
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted">{item.category}</div>
                  </div>
                  <Badge variant="red">
                    {item.quantity} {item.unit}
                  </Badge>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>

      {canReadAudit && (
        <Card>
          <SectionTitle title="Последние действия" />
          <List items={logs.map((log) => ({ title: `${log.actor?.name ?? "Система"} · ${log.action}`, meta: `${log.entity} · ${formatDate(log.createdAt)}`, href: "/app/settings" }))} />
        </Card>
      )}
    </div>
  );
}

function Metric({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div>
      <div className="text-sm text-muted">{label}</div>
      <div className={`mt-2 text-3xl font-semibold ${danger && value > 0 ? "text-danger" : ""}`}>{value}</div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="mb-4 text-base font-semibold">{title}</h2>;
}

function List({ items }: { items: { title: string; meta: string; href: string }[] }) {
  if (items.length === 0) return <p className="text-sm text-muted">Нет данных</p>;
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <Link key={`${item.title}-${index}`} href={item.href} className="block rounded-md bg-surface p-3 transition hover:bg-panelSoft">
          <div className="text-sm font-medium">{item.title}</div>
          <div className="mt-1 text-xs text-muted">{item.meta}</div>
        </Link>
      ))}
    </div>
  );
}
