"use client";

import Link from "next/link";
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type TaskStatus = "NEW" | "IN_PROGRESS" | "REVIEW" | "DONE" | "OVERDUE";
type Priority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

type BoardTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueAt: string | null;
  assignee: { name: string } | null;
  project: { name: string } | null;
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
  HIGH: "Высокий",
  CRITICAL: "Критичный"
};

function priorityVariant(priority: Priority) {
  if (priority === "CRITICAL") return "red" as const;
  if (priority === "HIGH") return "amber" as const;
  if (priority === "LOW") return "blue" as const;
  return "neutral" as const;
}

function DraggableCard({ task }: { task: BoardTask }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`min-w-0 cursor-grab rounded-lg border border-stroke bg-surface p-4 shadow-sm transition ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="mb-3 flex min-w-0 items-start justify-between gap-2">
        <h3 className="min-w-0 text-sm font-semibold leading-5 [overflow-wrap:anywhere]">{task.title}</h3>
        <span className="shrink-0">
          <Badge variant={priorityVariant(task.priority)}>{priorityLabels[task.priority]}</Badge>
        </span>
      </div>
      {task.description && <p className="line-clamp-2 text-sm leading-5 text-muted">{task.description}</p>}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-md bg-panelSoft px-2 py-1">{formatDate(task.dueAt)}</span>
        {task.assignee && <span className="rounded-md bg-panelSoft px-2 py-1">{task.assignee.name}</span>}
        {task.project && <span className="rounded-md bg-panelSoft px-2 py-1">{task.project.name}</span>}
      </div>
      <Link
        href={`/app/tasks/${task.id}`}
        className="mt-3 inline-flex text-xs font-medium text-brand transition hover:text-emerald-200"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        Открыть
      </Link>
    </article>
  );
}

function MobileTaskCard({
  task,
  updating,
  onStatusChange
}: {
  task: BoardTask;
  updating: boolean;
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
}) {
  const currentIndex = columns.findIndex((column) => column.id === task.status);
  const previousStatus = currentIndex > 0 ? columns[currentIndex - 1] : null;
  const nextStatus = currentIndex >= 0 && currentIndex < columns.length - 1 ? columns[currentIndex + 1] : null;

  return (
    <article className="rounded-lg border border-stroke bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="min-w-0 text-sm font-semibold leading-5 [overflow-wrap:anywhere]">{task.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={priorityVariant(task.priority)}>{priorityLabels[task.priority]}</Badge>
            <Badge>{columns.find((column) => column.id === task.status)?.label}</Badge>
          </div>
        </div>
      </div>
      {task.description && <p className="mt-3 line-clamp-3 text-sm leading-5 text-muted">{task.description}</p>}
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-md bg-panelSoft px-2 py-1">{formatDate(task.dueAt)}</span>
        {task.assignee && <span className="rounded-md bg-panelSoft px-2 py-1">{task.assignee.name}</span>}
        {task.project && <span className="rounded-md bg-panelSoft px-2 py-1">{task.project.name}</span>}
      </div>
      <div className="mt-4 grid gap-2">
        <label className="block">
          <span className="mb-2 block text-xs text-muted">Статус</span>
          <select
            value={task.status}
            disabled={updating}
            onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
            className="h-10 w-full rounded-md border border-stroke bg-panel px-3 text-sm outline-none transition focus:border-brand disabled:opacity-60"
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!previousStatus || updating}
            onClick={() => previousStatus && onStatusChange(task.id, previousStatus.id)}
            className="h-10 rounded-md border border-stroke px-3 text-sm font-medium text-muted transition hover:text-text disabled:opacity-40"
          >
            Назад
          </button>
          <button
            type="button"
            disabled={!nextStatus || updating}
            onClick={() => nextStatus && onStatusChange(task.id, nextStatus.id)}
            className="h-10 rounded-md bg-brand px-3 text-sm font-semibold text-surface transition hover:bg-emerald-300 disabled:opacity-40"
          >
            Дальше
          </button>
        </div>
        <Link href={`/app/tasks/${task.id}`} className="inline-flex h-10 items-center justify-center rounded-md border border-stroke text-sm font-medium text-muted transition hover:text-text">
          Открыть задачу
        </Link>
      </div>
    </article>
  );
}

function DroppableColumn({ status, label, tasks }: { status: TaskStatus; label: string; tasks: BoardTask[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section ref={setNodeRef} className={`min-h-[420px] rounded-lg border border-stroke bg-panel p-3 ${isOver ? "border-brand" : ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{label}</h2>
        <span className="rounded-md bg-panelSoft px-2 py-1 text-xs text-muted">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <DraggableCard key={task.id} task={task} />
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

  async function onDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const nextStatus = event.over?.id as TaskStatus | undefined;
    if (!nextStatus) return;
    await updateTaskStatus(taskId, nextStatus);
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {items.length === 0 && <div className="rounded-lg border border-stroke bg-panel p-4 text-sm text-muted">Задач пока нет</div>}
        {items.map((task) => (
          <MobileTaskCard key={task.id} task={task} updating={updatingTaskId === task.id} onStatusChange={updateTaskStatus} />
        ))}
      </div>

      <DndContext onDragEnd={onDragEnd}>
        <div className="hidden gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5">
          {columns.map((column) => (
            <DroppableColumn key={column.id} status={column.id} label={column.label} tasks={grouped[column.id]} />
          ))}
        </div>
      </DndContext>
    </>
  );
}
