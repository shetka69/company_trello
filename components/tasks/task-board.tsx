"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type TaskStatus = "NEW" | "IN_PROGRESS" | "REVIEW" | "DONE" | "OVERDUE";
type Priority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
type TaskType = "PRIVATE" | "PERSONAL" | "TEAM" | "DEPARTMENT" | "PROJECT";

type BoardTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  type: TaskType;
  dueAt: string | null;
  assignee: { name: string } | null;
  project: { name: string } | null;
};

const typeLabels: Record<TaskType, string> = {
  PRIVATE: "Приватная",
  PERSONAL: "Личная",
  TEAM: "Команда",
  DEPARTMENT: "Отдел",
  PROJECT: "Проект"
};

const columns: { id: TaskStatus; label: string }[] = [
  { id: "NEW", label: "Новая" },
  { id: "IN_PROGRESS", label: "В работе" },
  { id: "REVIEW", label: "На проверке" },
  { id: "DONE", label: "Завершена" },
  { id: "OVERDUE", label: "Просрочена" }
];

const priorityLabels: Record<Priority, string> = {
  LOW: "Низкий",
  NORMAL: "Обычный",
  HIGH: "Важный",
  CRITICAL: "Критический"
};

function priorityVariant(priority: Priority) {
  if (priority === "CRITICAL") return "red" as const;
  if (priority === "HIGH") return "red" as const;
  if (priority === "LOW") return "blue" as const;
  return "neutral" as const;
}

function cardStyle(task: BoardTask) {
  if (task.priority === "CRITICAL") {
    return "border-red-300/60 bg-red-400/15 shadow-[inset_4px_0_0_rgba(248,113,113,0.95)]";
  }

  if (task.priority === "HIGH") {
    return "border-rose-300/55 bg-rose-300/10 shadow-[inset_4px_0_0_rgba(251,113,133,0.9)]";
  }

  const styles: Record<TaskType, string> = {
    PRIVATE: "border-fuchsia-300/45 bg-fuchsia-300/10 shadow-[inset_4px_0_0_rgba(240,171,252,0.8)]",
    PERSONAL: "border-blue-300/40 bg-blue-300/10 shadow-[inset_4px_0_0_rgba(147,197,253,0.75)]",
    TEAM: "border-emerald-300/40 bg-emerald-300/10 shadow-[inset_4px_0_0_rgba(110,231,183,0.75)]",
    DEPARTMENT: "border-amber-300/45 bg-amber-300/10 shadow-[inset_4px_0_0_rgba(252,211,77,0.8)]",
    PROJECT: "border-cyan-300/40 bg-cyan-300/10 shadow-[inset_4px_0_0_rgba(103,232,249,0.75)]"
  };

  return styles[task.type];
}

function getAdjacentStatuses(status: TaskStatus) {
  const currentIndex = columns.findIndex((column) => column.id === status);
  return {
    previousStatus: currentIndex > 0 ? columns[currentIndex - 1] : null,
    nextStatus: currentIndex >= 0 && currentIndex < columns.length - 1 ? columns[currentIndex + 1] : null
  };
}

function TaskCard({
  task,
  updating,
  onStatusChange
}: {
  task: BoardTask;
  updating: boolean;
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
}) {
  const { previousStatus, nextStatus } = getAdjacentStatuses(task.status);

  return (
    <article className={`relative min-w-0 rounded-lg border bg-surface p-4 shadow-sm transition hover:border-brand/60 ${cardStyle(task)}`}>
      <Link href={`/app/tasks/${task.id}`} className="absolute inset-0 rounded-lg" aria-label={`Открыть задачу ${task.title}`} />

      <div className="pointer-events-none relative z-10">
        <div className="mb-3 flex min-w-0 items-start justify-between gap-2">
          <h3 className="min-w-0 text-sm font-semibold leading-5 [overflow-wrap:anywhere]">{task.title}</h3>
          <span className="shrink-0">
            <Badge variant={priorityVariant(task.priority)}>{priorityLabels[task.priority]}</Badge>
          </span>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-md border border-stroke bg-panel/70 px-2 py-1 text-xs text-muted">{typeLabels[task.type]}</span>
          <span className="rounded-md border border-stroke bg-panel/70 px-2 py-1 text-xs text-muted">{columns.find((column) => column.id === task.status)?.label}</span>
        </div>
        {task.description && <p className="line-clamp-2 text-sm leading-5 text-muted [overflow-wrap:anywhere]">{task.description}</p>}
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
          <span className="rounded-md bg-panelSoft px-2 py-1">{formatDate(task.dueAt)}</span>
          {task.assignee && <span className="rounded-md bg-panelSoft px-2 py-1">{task.assignee.name}</span>}
          {task.project && <span className="rounded-md bg-panelSoft px-2 py-1">{task.project.name}</span>}
        </div>
      </div>

      <div className="relative z-20 mt-4 grid grid-cols-2 gap-2">
        <StatusButton
          label={previousStatus ? previousStatus.label : "Назад"}
          icon="left"
          disabled={!previousStatus || updating}
          onClick={() => previousStatus && onStatusChange(task.id, previousStatus.id)}
        />
        <StatusButton
          label={nextStatus ? nextStatus.label : "Дальше"}
          icon="right"
          disabled={!nextStatus || updating}
          onClick={() => nextStatus && onStatusChange(task.id, nextStatus.id)}
        />
      </div>
    </article>
  );
}

function StatusButton({
  label,
  icon,
  disabled,
  onClick
}: {
  label: string;
  icon: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = icon === "left" ? ArrowLeft : ArrowRight;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 min-w-0 items-center justify-center gap-2 rounded-md border border-stroke bg-panel px-2 text-xs font-medium text-muted transition hover:border-brand hover:text-text disabled:cursor-not-allowed disabled:opacity-35"
      title={label}
    >
      {icon === "left" && <Icon size={14} />}
      <span className="truncate">{label}</span>
      {icon === "right" && <Icon size={14} />}
    </button>
  );
}

function Column({
  label,
  tasks,
  updatingTaskId,
  onStatusChange
}: {
  label: string;
  tasks: BoardTask[];
  updatingTaskId: string | null;
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
}) {
  return (
    <section className="min-h-[420px] rounded-lg border border-stroke bg-panel p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{label}</h2>
        <span className="rounded-md bg-panelSoft px-2 py-1 text-xs text-muted">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} updating={updatingTaskId === task.id} onStatusChange={onStatusChange} />
        ))}
      </div>
    </section>
  );
}

export function TaskBoard({ tasks }: { tasks: BoardTask[] }) {
  const router = useRouter();
  const [items, setItems] = useState(tasks);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    setItems(tasks);
  }, [tasks]);

  const grouped = useMemo(() => {
    return columns.reduce<Record<TaskStatus, BoardTask[]>>(
      (acc, column) => {
        acc[column.id] = items.filter((task) => task.status === column.id);
        return acc;
      },
      { NEW: [], IN_PROGRESS: [], REVIEW: [], DONE: [], OVERDUE: [] }
    );
  }, [items]);

  async function updateTaskStatus(taskId: string, nextStatus: TaskStatus) {
    if (!columns.some((column) => column.id === nextStatus)) return;
    const targetTask = items.find((task) => task.id === taskId);
    if (!targetTask || targetTask.status === nextStatus || updatingTaskId) return;

    const previous = items;
    setUpdatingTaskId(taskId);
    setItems((current) => current.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task)));

    const response = await fetch("/api/tasks/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: nextStatus })
    });

    if (!response.ok) {
      setItems(previous);
      setUpdatingTaskId(null);
      return;
    }

    setUpdatingTaskId(null);
    router.refresh();
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {items.length === 0 && <div className="rounded-lg border border-stroke bg-panel p-4 text-sm text-muted">Задач пока нет</div>}
        {items.map((task) => (
          <TaskCard key={task.id} task={task} updating={updatingTaskId === task.id} onStatusChange={updateTaskStatus} />
        ))}
      </div>

      <div className="hidden gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5">
        {columns.map((column) => (
          <Column key={column.id} label={column.label} tasks={grouped[column.id]} updatingTaskId={updatingTaskId} onStatusChange={updateTaskStatus} />
        ))}
      </div>
    </>
  );
}
