"use client";

import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Option = {
  id: string;
  name: string;
};

type Priority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
type TaskType = "PRIVATE" | "PERSONAL" | "TEAM" | "DEPARTMENT" | "PROJECT";

const priorityOptions: { value: Priority; label: string }[] = [
  { value: "LOW", label: "Низкий" },
  { value: "NORMAL", label: "Обычный" },
  { value: "HIGH", label: "Важный" },
  { value: "CRITICAL", label: "Критический" }
];

const typeOptions: { value: TaskType; label: string }[] = [
  { value: "PRIVATE", label: "Приватная" },
  { value: "PERSONAL", label: "Личная" },
  { value: "TEAM", label: "Командная" },
  { value: "DEPARTMENT", label: "Отдел" },
  { value: "PROJECT", label: "Проект" }
];

export function TaskCreateForm({ assignees, departments, projects }: { assignees: Option[]; departments: Option[]; projects: Option[] }) {
  const router = useRouter();
  const defaultAssigneeId = assignees.length === 1 ? assignees[0].id : "";
  const defaultDepartmentId = departments.length === 1 ? departments[0].id : "";
  const defaultProjectId = projects.length === 1 ? projects[0].id : "";
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState(defaultAssigneeId);
  const [departmentId, setDepartmentId] = useState(defaultDepartmentId);
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState<Priority>("NORMAL");
  const [type, setType] = useState<TaskType>("PERSONAL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => title.trim().length >= 3 && !loading, [title, loading]);

  const reset = useCallback(() => {
    setTitle("");
    setDescription("");
    setAssigneeId(defaultAssigneeId);
    setDepartmentId(defaultDepartmentId);
    setProjectId(defaultProjectId);
    setDueAt("");
    setPriority("NORMAL");
    setType("PERSONAL");
    setError("");
  }, [defaultAssigneeId, defaultDepartmentId, defaultProjectId]);

  const closeCreateForm = useCallback(() => {
    reset();
    setOpen(false);
  }, [reset]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCreateForm();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeCreateForm, open]);

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

    closeCreateForm();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={closeCreateForm}>
      <form
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl space-y-4 overflow-y-auto rounded-lg border border-stroke bg-panel p-5 shadow-2xl"
      >
        <FormHeader title="Новая задача" onClose={closeCreateForm} />

        <label className="block">
          <span className="mb-2 block text-sm text-muted">Название</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-11 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
            placeholder="Например: подготовить кабель для сборки"
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

        <div className="grid gap-3 md:grid-cols-2">
          <Select label="Тип" value={type} onChange={(value) => setType(value as TaskType)} options={typeOptions} />
          <Select label="Приоритет" value={priority} onChange={(value) => setPriority(value as Priority)} options={priorityOptions} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Select label="Исполнитель" value={assigneeId} onChange={setAssigneeId} options={assignees} placeholder={assignees.length === 1 ? undefined : "Не назначен"} />
          <DateField label="Срок" value={dueAt} onChange={setDueAt} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Select label="Отдел" value={departmentId} onChange={setDepartmentId} options={departments} placeholder={departments.length === 1 ? undefined : "По умолчанию"} />
          <Select label="Проект" value={projectId} onChange={setProjectId} options={projects} placeholder={projects.length === 1 ? undefined : "Без проекта"} />
        </div>

        {error && <div className="rounded-md border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">{error}</div>}

        <div className="flex justify-end gap-2">
          <SecondaryButton onClick={closeCreateForm}>Отмена</SecondaryButton>
          <Button disabled={!canSubmit}>{loading ? "Создание..." : "Создать"}</Button>
        </div>
      </form>
    </div>
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

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
        type="datetime-local"
      />
    </label>
  );
}

function FormHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-stroke text-muted transition hover:text-text"
        aria-label="Закрыть"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 rounded-md border border-stroke px-4 text-sm font-medium text-muted transition hover:text-text"
    >
      {children}
    </button>
  );
}
