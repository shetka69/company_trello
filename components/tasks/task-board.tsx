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
      className={`cursor-grab rounded-lg border border-stroke bg-surface p-4 shadow-sm transition ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-5">{task.title}</h3>
        <Badge variant={priorityVariant(task.priority)}>{priorityLabels[task.priority]}</Badge>
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

  async function onDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const nextStatus = event.over?.id as TaskStatus | undefined;
    if (!nextStatus || !columns.some((column) => column.id === nextStatus)) return;

    const previous = items;
    setItems((current) => current.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task)));

    const response = await fetch("/api/tasks/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: nextStatus })
    });

    if (!response.ok) {
      setItems(previous);
      return;
    }

    router.refresh();
  }

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 overflow-x-auto pb-2 lg:grid-cols-5">
        {columns.map((column) => (
          <DroppableColumn key={column.id} status={column.id} label={column.label} tasks={grouped[column.id]} />
        ))}
      </div>
    </DndContext>
  );
}
