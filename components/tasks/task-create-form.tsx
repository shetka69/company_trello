"use client";

import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Option = {
  id: string;
  name: string;
};

type Priority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
type TaskType = "PERSONAL" | "TEAM" | "DEPARTMENT" | "PROJECT";

const priorityOptions: { value: Priority; label: string }[] = [
  { value: "LOW", label: "Низкий" },
  { value: "NORMAL", label: "Обычный" },
  { value: "HIGH", label: "Высокий" },
  { value: "CRITICAL", label: "Критичный" }
];

const typeOptions: { value: TaskType; label: string }[] = [
  { value: "PERSONAL", label: "Личная" },
  { value: "TEAM", label: "Командная" },
  { value: "DEPARTMENT", label: "Отдел" },
  { value: "PROJECT", label: "Проект" }
];

export function TaskCreateForm({
  assignees,
  departments,
  projects
}: {
  assignees: Option[];
  departments: Option[];
  projects: Option[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState<Priority>("NORMAL");
  const [type, setType] = useState<TaskType>("PERSONAL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => title.trim().length >= 3 && !loading, [title, loading]);

  function reset() {
    setTitle("");
    setDescription("");
    setAssigneeId("");
    setDepartmentId("");
    setProjectId("");
    setDueAt("");
    setPriority("NORMAL");
    setType("PERSONAL");
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || undefined,
        assigneeId: assigneeId || undefined,
        departmentId: departmentId || undefined,
        projectId: projectId || undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
        priority,
        type
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось создать задачу. Проверьте поля и права доступа.");
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-surface transition hover:bg-emerald-300"
      >
        <Plus size={18} />
        Новая задача
      </button>
    );
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Новая задача</h2>
            <p className="mt-1 text-sm text-muted">Создайте задачу и сразу назначьте ответственного, срок и приоритет.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              reset();
              setOpen(false);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-stroke bg-panel text-muted transition hover:text-text"
            aria-label="Закрыть форму"
          >
            <X size={18} />
          </button>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-muted">Название</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-11 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
            placeholder="Например: Подготовить кабель для сборки"
            required
            minLength={3}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-muted">Описание</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-24 w-full resize-y rounded-md border border-stroke bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand"
            placeholder="Контекст, требования, что считать готовым"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Select label="Тип" value={type} onChange={(value) => setType(value as TaskType)} options={typeOptions} />
          <Select label="Приоритет" value={priority} onChange={(value) => setPriority(value as Priority)} options={priorityOptions} />
          <Select label="Исполнитель" value={assigneeId} onChange={setAssigneeId} options={assignees} placeholder="Не назначен" />
          <label className="block">
            <span className="mb-2 block text-sm text-muted">Срок</span>
            <input
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
              className="h-11 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
              type="datetime-local"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Отдел" value={departmentId} onChange={setDepartmentId} options={departments} placeholder="По умолчанию" />
          <Select label="Проект" value={projectId} onChange={setProjectId} options={projects} placeholder="Без проекта" />
        </div>

        {error && <div className="rounded-md border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">{error}</div>}

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              reset();
              setOpen(false);
            }}
            className="h-10 rounded-md border border-stroke px-4 text-sm font-medium text-muted transition hover:text-text"
          >
            Отмена
          </button>
          <Button disabled={!canSubmit}>{loading ? "Создание..." : "Создать задачу"}</Button>
        </div>
      </form>
    </Card>
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
        className="h-11 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
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
