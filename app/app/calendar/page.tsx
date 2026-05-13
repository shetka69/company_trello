import Link from "next/link";
import type { CalendarEventType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CalendarEventCreateForm, CalendarEventEditForm } from "@/components/calendar/calendar-forms";
import { requireUser } from "@/lib/auth";
import { taskScopeFor } from "@/lib/data-scope";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type ViewMode = "day" | "week" | "month";
type CalendarFilterType = "EVENT" | "REMINDER" | "TASK_DEADLINE" | "DELIVERY";

const typeLabel: Record<"EVENT" | "REMINDER", string> = {
  EVENT: "Событие",
  REMINDER: "Напоминание"
};

const filterTypes: { type: CalendarFilterType; label: string; variant: "green" | "red" | "amber" | "blue" | "neutral" }[] = [
  { type: "EVENT", label: "События", variant: "green" },
  { type: "TASK_DEADLINE", label: "Дедлайны задач", variant: "red" },
  { type: "DELIVERY", label: "Поставки", variant: "amber" },
  { type: "REMINDER", label: "Напоминания", variant: "blue" }
];

function typeVariant(type: "EVENT" | "REMINDER") {
  if (type === "REMINDER") return "blue" as const;
  return "green" as const;
}

export default async function CalendarPage({
  searchParams
}: {
  searchParams?: Promise<{ mode?: string; date?: string; types?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const mode = parseMode(params?.mode);
  const anchor = parseAnchorDate(params?.date);
  const selectedTypes = parseTypes(params?.types);
  const range = getRange(mode, anchor);
  const canManageCalendar = hasPermission(user.role.code, "calendar:manage");
  const selectedEventTypes = selectedTypes.filter((type): type is "EVENT" | "REMINDER" => type === "EVENT" || type === "REMINDER");
  const showTaskDeadlines = selectedTypes.includes("TASK_DEADLINE");
  const showDeliveries = selectedTypes.includes("DELIVERY");

  const [events, deadlineTasks, deliveries, users] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: {
        companyId: user.companyId,
        startsAt: { gte: range.start, lt: range.end },
        type: { in: selectedEventTypes }
      },
      orderBy: { startsAt: "asc" }
    }),
    showTaskDeadlines
      ? prisma.task.findMany({
          where: {
            ...taskScopeFor(user),
            dueAt: { gte: range.start, lt: range.end }
          },
          select: { id: true, title: true, dueAt: true, status: true, assignee: { select: { name: true } } },
          orderBy: { dueAt: "asc" }
        })
      : [],
    showDeliveries
      ? prisma.delivery.findMany({
          where: {
            companyId: user.companyId,
            expectedAt: { gte: range.start, lt: range.end }
          },
          orderBy: { expectedAt: "asc" }
        })
      : [],
    canManageCalendar
      ? prisma.user.findMany({
          where: { companyId: user.companyId, isActive: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" }
        })
      : []
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Календарь</h1>
          <p className="mt-1 text-sm text-muted">{range.title}</p>
        </div>
        {canManageCalendar && <CalendarEventCreateForm users={users} />}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          <ModeLink href={calendarHref({ mode: "day", date: localDateKey(new Date()), selectedTypes })} active={mode === "day" && localDateKey(anchor) === localDateKey(new Date())}>
            Сегодня
          </ModeLink>
          <ModeLink href={calendarHref({ mode: "week", date: localDateKey(anchor), selectedTypes })} active={mode === "week"}>
            Неделя
          </ModeLink>
          <ModeLink href={calendarHref({ mode: "month", date: localDateKey(anchor), selectedTypes })} active={mode === "month"}>
            Месяц
          </ModeLink>
        </div>

        <div className="flex flex-wrap gap-2">
          <ModeLink href={calendarHref({ mode, date: localDateKey(shiftAnchor(anchor, mode, -1)), selectedTypes })} active={false}>
            Назад
          </ModeLink>
          <ModeLink href={calendarHref({ mode, date: localDateKey(shiftAnchor(anchor, mode, 1)), selectedTypes })} active={false}>
            Вперед
          </ModeLink>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTypes.map((filter) => {
          const active = selectedTypes.includes(filter.type);
          const nextTypes = toggleType(selectedTypes, filter.type);
          return (
            <Link key={filter.type} href={calendarHref({ mode, date: localDateKey(anchor), selectedTypes: nextTypes })}>
              <Badge variant={active ? filter.variant : "neutral"} className={active ? "" : "opacity-60"}>
                {filter.label}
              </Badge>
            </Link>
          );
        })}
      </div>

      <div className={`grid gap-4 ${mode === "day" ? "lg:grid-cols-1" : "lg:grid-cols-7"}`}>
        {range.days.map((day) => {
          const key = localDateKey(day);
          const dayEvents = events.filter((event) => localDateKey(event.startsAt) === key);
          const dayTasks = deadlineTasks.filter((task) => task.dueAt && localDateKey(task.dueAt) === key);
          const dayDeliveries = deliveries.filter((delivery) => delivery.expectedAt && localDateKey(delivery.expectedAt) === key);
          const outsideMonth = mode === "month" && day.getMonth() !== anchor.getMonth();

          return (
            <Card key={key} className={`min-h-72 ${outsideMonth ? "opacity-55" : ""}`}>
              <div className="mb-4">
                <div className="text-sm font-semibold">{day.toLocaleDateString("ru-RU", { weekday: "short", day: "2-digit", month: "short" })}</div>
                {localDateKey(day) === localDateKey(new Date()) && <div className="mt-1 text-xs text-brand">Сегодня</div>}
              </div>
              <div className="space-y-2">
                {dayEvents.length === 0 && dayTasks.length === 0 && dayDeliveries.length === 0 && <p className="text-sm text-muted">Нет событий</p>}
                {dayEvents.map((event) => (
                  <CalendarEventCard key={event.id} event={event} canManageCalendar={canManageCalendar} users={users} />
                ))}
                {dayTasks.map((task) => (
                  <Link key={task.id} href={`/app/tasks/${task.id}`} className="block min-w-0 rounded-md bg-surface p-3 transition hover:bg-panelSoft">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <Badge variant={task.status === "DONE" ? "green" : "red"}>Дедлайн задачи</Badge>
                      <div className="min-w-0 break-words text-xs text-muted">{formatDate(task.dueAt)}</div>
                    </div>
                    <div className="mt-2 min-w-0 text-sm font-medium [overflow-wrap:anywhere]">{task.title}</div>
                    <div className="mt-1 text-xs text-muted">{task.assignee?.name ?? "Без исполнителя"}</div>
                  </Link>
                ))}
                {dayDeliveries.map((delivery) => (
                  <div key={delivery.id} className="min-w-0 rounded-md bg-surface p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <Badge variant="amber">Поставка</Badge>
                      <div className="min-w-0 break-words text-xs text-muted">{formatDate(delivery.expectedAt)}</div>
                    </div>
                    <div className="mt-2 min-w-0 text-sm font-medium [overflow-wrap:anywhere]">{delivery.title}</div>
                    <div className="mt-1 min-w-0 text-xs text-muted [overflow-wrap:anywhere]">
                      {delivery.supplier ?? "Поставщик не указан"} · {delivery.status}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CalendarEventCard({
  event,
  canManageCalendar,
  users
}: {
  event: {
    id: string;
    type: CalendarEventType;
    title: string;
    description: string | null;
    startsAt: Date;
    endsAt: Date | null;
    assigneeId: string | null;
  };
  canManageCalendar: boolean;
  users: { id: string; name: string }[];
}) {
  const type = event.type === "REMINDER" ? "REMINDER" : "EVENT";

  return (
    <div className="min-w-0 rounded-md bg-surface p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Badge variant={typeVariant(type)}>{typeLabel[type]}</Badge>
        <div className="min-w-0 break-words text-xs text-muted">{formatDate(event.startsAt)}</div>
      </div>
      <div className="mt-2 min-w-0 text-sm font-medium [overflow-wrap:anywhere]">{event.title}</div>
      {event.description && <div className="mt-1 min-w-0 text-xs leading-5 text-muted [overflow-wrap:anywhere]">{event.description}</div>}
      {canManageCalendar && (
        <CalendarEventEditForm
          event={{
            id: event.id,
            type,
            title: event.title,
            description: event.description,
            startsAt: event.startsAt.toISOString(),
            endsAt: event.endsAt?.toISOString() ?? null,
            assigneeId: event.assigneeId
          }}
          users={users}
        />
      )}
    </div>
  );
}

function ModeLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
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

function parseMode(value?: string): ViewMode {
  if (value === "day" || value === "month") return value;
  return "week";
}

function parseAnchorDate(value?: string) {
  if (!value) return startOfDay(new Date());
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return startOfDay(new Date());
  return startOfDay(parsed);
}

function parseTypes(value?: string): CalendarFilterType[] {
  const all = filterTypes.map((filter) => filter.type);
  if (!value) return all;

  const requested = value.split(",").filter((type): type is CalendarFilterType => all.includes(type as CalendarFilterType));
  return requested.length > 0 ? requested : all;
}

function toggleType(types: CalendarFilterType[], type: CalendarFilterType) {
  if (types.includes(type)) {
    const next = types.filter((item) => item !== type);
    return next.length > 0 ? next : types;
  }

  return [...types, type];
}

function getRange(mode: ViewMode, anchor: Date) {
  if (mode === "day") {
    const start = startOfDay(anchor);
    const end = addDays(start, 1);
    return {
      start,
      end,
      days: [start],
      title: start.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })
    };
  }

  if (mode === "month") {
    const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
    const start = startOfWeek(monthStart);
    const end = addDays(endOfWeek(addDays(monthEnd, -1)), 1);
    return {
      start,
      end,
      days: daysBetween(start, end),
      title: anchor.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
    };
  }

  const start = startOfWeek(anchor);
  const end = addDays(start, 7);
  return {
    start,
    end,
    days: daysBetween(start, end),
    title: `${start.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })} - ${addDays(end, -1).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })}`
  };
}

function calendarHref({ mode, date, selectedTypes }: { mode: ViewMode; date: string; selectedTypes: CalendarFilterType[] }) {
  const params = new URLSearchParams();
  params.set("mode", mode);
  params.set("date", date);

  if (selectedTypes.length !== filterTypes.length) {
    params.set("types", selectedTypes.join(","));
  }

  return `/app/calendar?${params.toString()}`;
}

function shiftAnchor(anchor: Date, mode: ViewMode, direction: 1 | -1) {
  if (mode === "day") return addDays(anchor, direction);
  if (mode === "month") return new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1);
  return addDays(anchor, direction * 7);
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function startOfWeek(date: Date) {
  const value = startOfDay(date);
  const day = value.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(value, offset);
}

function endOfWeek(date: Date) {
  return addDays(startOfWeek(date), 6);
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function daysBetween(start: Date, end: Date) {
  const days: Date[] = [];
  for (let cursor = startOfDay(start); cursor < end; cursor = addDays(cursor, 1)) {
    days.push(cursor);
  }
  return days;
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
