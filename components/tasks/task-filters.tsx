"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Option = {
  id: string;
  name: string;
};

const statusOptions = [
  { value: "NEW", label: "Новая" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "REVIEW", label: "На проверке" },
  { value: "DONE", label: "Завершена" },
  { value: "OVERDUE", label: "Просрочена" }
];

const priorityOptions = [
  { value: "LOW", label: "Низкий" },
  { value: "NORMAL", label: "Обычный" },
  { value: "HIGH", label: "Высокий" },
  { value: "CRITICAL", label: "Критичный" }
];

const sortOptions = [
  { value: "created", label: "Новые" },
  { value: "due", label: "Срок" },
  { value: "priority", label: "Приоритет" }
];

export function TaskFilters({ assignees, projects }: { assignees: Option[]; projects: Option[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const values = useMemo(
    () => ({
      status: searchParams.get("status") ?? "",
      priority: searchParams.get("priority") ?? "",
      assigneeId: searchParams.get("assigneeId") ?? "",
      projectId: searchParams.get("projectId") ?? "",
      mine: searchParams.get("mine") === "1",
      sort: searchParams.get("sort") ?? "created"
    }),
    [searchParams]
  );

  function update(next: Record<string, string | boolean>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(next).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        if (value) params.set(key, "1");
        else params.delete(key);
        return;
      }

      if (value) params.set(key, value);
      else params.delete(key);
    });

    router.push(`/app/tasks?${params.toString()}`);
  }

  function applySearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update({ q: query.trim() });
  }

  function reset() {
    setQuery("");
    router.push("/app/tasks");
  }

  return (
    <div className="rounded-lg border border-stroke bg-panel p-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,1.4fr)_repeat(5,minmax(130px,1fr))_auto] xl:items-end">
        <form onSubmit={applySearch} className="min-w-0">
          <span className="mb-2 block text-xs text-muted">Поиск</span>
          <div className="flex min-w-0 gap-2">
            <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 min-w-0 flex-1 rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
            placeholder="Поиск по задачам"
          />
            <Button className="shrink-0">Найти</Button>
          </div>
        </form>
        <Select label="Статус" value={values.status} onChange={(value) => update({ status: value })} options={statusOptions} />
        <Select label="Приоритет" value={values.priority} onChange={(value) => update({ priority: value })} options={priorityOptions} />
        <Select label="Исполнитель" value={values.assigneeId} onChange={(value) => update({ assigneeId: value })} options={assignees.map((item) => ({ value: item.id, label: item.name }))} />
        <Select label="Проект" value={values.projectId} onChange={(value) => update({ projectId: value })} options={projects.map((item) => ({ value: item.id, label: item.name }))} />
        <Select label="Сортировка" value={values.sort} onChange={(value) => update({ sort: value })} options={sortOptions} />
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => update({ mine: !values.mine })}
            className={`h-10 rounded-md border px-3 text-sm font-medium transition ${
              values.mine ? "border-brand bg-brand/10 text-emerald-100" : "border-stroke text-muted hover:text-text"
            }`}
          >
            Мои
          </button>
          <button type="button" onClick={reset} className="h-10 rounded-md border border-stroke px-3 text-sm font-medium text-muted transition hover:text-text">
            Сброс
          </button>
        </div>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
      >
        <option value="">Все</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
