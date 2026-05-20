"use client";

import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Option = {
  id: string;
  name: string;
};

type SearchResult = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
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
  const searchRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setResultsOpen(false);
      }
    }

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoadingResults(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoadingResults(true);
      try {
        const response = await fetch(`/api/search?scope=tasks&q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal
        });

        if (response.ok) {
          const data = (await response.json()) as { results: SearchResult[] };
          setResults(data.results);
          setResultsOpen(true);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setLoadingResults(false);
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

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
    setResultsOpen(false);
    update({ q: query.trim() });
  }

  function reset() {
    setQuery("");
    setResults([]);
    router.push("/app/tasks");
  }

  return (
    <div className="rounded-lg border border-stroke bg-panel p-4">
      <button
        type="button"
        onClick={() => setFiltersOpen((value) => !value)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-stroke px-3 text-sm font-medium text-muted transition hover:text-text md:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Поиск и фильтры
        </span>
        <span>{filtersOpen ? "Скрыть" : "Открыть"}</span>
      </button>

      <div className={`${filtersOpen ? "mt-3 grid" : "hidden"} gap-3 md:grid xl:grid-cols-[minmax(260px,1.4fr)_repeat(5,minmax(130px,1fr))_auto] xl:items-end`}>
        <form ref={searchRef} onSubmit={applySearch} className="relative min-w-0">
          <span className="mb-2 block text-xs text-muted">Поиск</span>
          <div className="flex min-w-0 gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setResultsOpen(true);
                }}
                onFocus={() => setResultsOpen(true)}
                className="h-10 min-w-0 w-full rounded-md border border-stroke bg-surface py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand"
                placeholder="Поиск по задачам"
              />
            </div>
            <Button className="shrink-0 bg-emerald-400 text-black shadow-none hover:bg-emerald-300 active:bg-emerald-500">Найти</Button>
          </div>

          {resultsOpen && query.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-[68px] z-30 overflow-hidden rounded-lg border border-stroke bg-panel shadow-clean">
              <div className="max-h-80 overflow-y-auto p-2">
                {loadingResults && <div className="px-3 py-2 text-sm text-muted">Поиск...</div>}
                {!loadingResults && results.length === 0 && <div className="px-3 py-2 text-sm text-muted">Ничего не найдено</div>}
                {!loadingResults &&
                  results.map((result) => (
                    <Link
                      key={result.id}
                      href={result.href}
                      onClick={() => {
                        setResultsOpen(false);
                        setQuery("");
                      }}
                      className="block rounded-md px-3 py-2 transition hover:bg-panelSoft"
                    >
                      <div className="truncate text-sm font-medium">{result.title}</div>
                      <div className="mt-1 truncate text-xs text-muted">{result.subtitle}</div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
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
