"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Option = {
  id: string;
  name: string;
};

type Priority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
type TaskStatus = "NEW" | "IN_PROGRESS" | "REVIEW" | "DONE" | "OVERDUE";
type TaskType = "PERSONAL" | "TEAM" | "DEPARTMENT" | "PROJECT";

const priorityOptions: { value: Priority; label: string }[] = [
  { value: "LOW", label: "Низкий" },
  { value: "NORMAL", label: "Обычный" },
  { value: "HIGH", label: "Высокий" },
  { value: "CRITICAL", label: "Критичный" }
];

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "NEW", label: "Новая" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "REVIEW", label: "На проверке" },
  { value: "DONE", label: "Завершена" },
  { value: "OVERDUE", label: "Просрочена" }
];

const typeOptions: { value: TaskType; label: string }[] = [
  { value: "PERSONAL", label: "Личная" },
  { value: "TEAM", label: "Командная" },
  { value: "DEPARTMENT", label: "Отдел" },
  { value: "PROJECT", label: "Проект" }
];

type EditableTask = {
  id: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  departmentId: string | null;
  projectId: string | null;
  dueAt: string | null;
  priority: Priority;
  status: TaskStatus;
  type: TaskType;
};

export function TaskEditForm({
  task,
  assignees,
  departments,
  projects
}: {
  task: EditableTask;
  assignees: Option[];
  departments: Option[];
  projects: Option[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");
  const [departmentId, setDepartmentId] = useState(task.departmentId ?? "");
  const [projectId, setProjectId] = useState(task.projectId ?? "");
  const [dueAt, setDueAt] = useState(toDateTimeLocalValue(task.dueAt));
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [type, setType] = useState<TaskType>(task.type);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => title.trim().length >= 3 && !loading, [title, loading]);

  function reset() {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setAssigneeId(task.assigneeId ?? "");
    setDepartmentId(task.departmentId ?? "");
    setProjectId(task.projectId ?? "");
    setDueAt(toDateTimeLocalValue(task.dueAt));
    setPriority(task.priority);
    setStatus(task.status);
    setType(task.type);
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        assigneeId: assigneeId || null,
        departmentId: departmentId || null,
        projectId: projectId || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        priority,
        status,
        type
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось сохранить изменения.");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-stroke px-3 text-sm font-medium text-muted transition hover:text-text"
      >
        <Pencil size={16} />
        Редактировать
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Редактирование</h2>
        <button
          type="button"
          onClick={() => {
            reset();
            setEditing(false);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-stroke text-muted transition hover:text-text"
          aria-label="Закрыть редактирование"
        >
          <X size={18} />
        </button>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm text-muted">Название</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
          minLength={3}
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-muted">Описание</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-24 w-full resize-y rounded-md border border-stroke bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <Select label="Статус" value={status} onChange={(value) => setStatus(value as TaskStatus)} options={statusOptions} />
        <Select label="Приоритет" value={priority} onChange={(value) => setPriority(value as Priority)} options={priorityOptions} />
        <Select label="Тип" value={type} onChange={(value) => setType(value as TaskType)} options={typeOptions} />
        <label className="block">
          <span className="mb-2 block text-sm text-muted">Срок</span>
          <input
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
            className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
            type="datetime-local"
          />
        </label>
      </div>

      <Select label="Исполнитель" value={assigneeId} onChange={setAssigneeId} options={assignees} placeholder="Не назначен" />
      <Select label="Отдел" value={departmentId} onChange={setDepartmentId} options={departments} placeholder="Без отдела" />
      <Select label="Проект" value={projectId} onChange={setProjectId} options={projects} placeholder="Без проекта" />

      {error && <div className="text-sm text-danger">{error}</div>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            reset();
            setEditing(false);
          }}
          className="h-10 rounded-md border border-stroke px-4 text-sm font-medium text-muted transition hover:text-text"
        >
          Отмена
        </button>
        <Button disabled={!canSubmit}>{loading ? "Сохранение..." : "Сохранить"}</Button>
      </div>
    </form>
  );
}

export function TaskDeleteButton({ taskId, title }: { taskId: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (loading) return;
    const confirmed = window.confirm(`Удалить задачу "${title}"? Это действие нельзя отменить.`);
    if (!confirmed) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE"
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось удалить задачу.");
      return;
    }

    router.push("/app/tasks");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={remove}
        disabled={loading}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-rose-300/25 px-3 text-sm font-medium text-rose-100 transition hover:bg-rose-300/10 disabled:opacity-60"
      >
        <Trash2 size={16} />
        {loading ? "Удаление..." : "Удалить"}
      </button>
      {error && <div className="text-sm text-danger">{error}</div>}
    </div>
  );
}

export function CommentForm({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: trimmed })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Комментарий не сохранен.");
      return;
    }

    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        className="min-h-24 w-full resize-y rounded-md border border-stroke bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand"
        placeholder="Добавить комментарий"
      />
      {error && <div className="text-sm text-danger">{error}</div>}
      <div className="flex justify-end">
        <Button disabled={!body.trim() || loading}>{loading ? "Сохранение..." : "Отправить"}</Button>
      </div>
    </form>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value?: string; id?: string; label?: string; name?: string }[];
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const optionValue = option.value ?? option.id ?? "";
          return (
            <option key={optionValue} value={optionValue}>
              {option.label ?? option.name}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function ChecklistForm({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || loading) return;

    setLoading(true);

    const response = await fetch(`/api/tasks/${taskId}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed })
    });

    setLoading(false);

    if (response.ok) {
      setTitle("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="h-10 min-w-0 flex-1 rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
        placeholder="Новый пункт чеклиста"
      />
      <button
        type="submit"
        disabled={!title.trim() || loading}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand text-surface transition hover:bg-emerald-300 disabled:opacity-60"
        aria-label="Добавить пункт"
      >
        <Plus size={18} />
      </button>
    </form>
  );
}

export function ChecklistToggle({ taskId, itemId, done }: { taskId: string; itemId: string; done: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(nextDone: boolean) {
    setLoading(true);

    const response = await fetch(`/api/tasks/${taskId}/checklist`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, done: nextDone })
    });

    setLoading(false);

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <input
      type="checkbox"
      checked={done}
      disabled={loading}
      onChange={(event) => toggle(event.target.checked)}
      className="h-4 w-4 accent-emerald-400"
    />
  );
}
