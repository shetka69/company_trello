"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Option = {
  id: string;
  name: string;
};

export function InventoryFilters({
  categories,
  users
}: {
  categories: string[];
  users: Option[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const values = useMemo(
    () => ({
      category: searchParams.get("category") ?? "",
      responsibleId: searchParams.get("responsibleId") ?? "",
      low: searchParams.get("low") === "1",
      view: searchParams.get("view") === "table" ? "table" : "cards"
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

    router.push(`/app/inventory?${params.toString()}`);
  }

  function applySearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update({ q: query.trim() });
  }

  function reset() {
    setQuery("");
    router.push("/app/inventory");
  }

  return (
    <div className="rounded-lg border border-stroke bg-panel p-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,1.4fr)_repeat(3,minmax(140px,1fr))_auto] xl:items-end">
        <form onSubmit={applySearch} className="min-w-0">
          <span className="mb-2 block text-xs text-muted">Поиск</span>
          <div className="flex min-w-0 gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 min-w-0 flex-1 rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
              placeholder="Название или категория"
            />
            <Button className="shrink-0 bg-emerald-400 text-black shadow-none hover:bg-emerald-300 active:bg-emerald-500">Найти</Button>
          </div>
        </form>
        <Select
          label="Категория"
          value={values.category}
          onChange={(value) => update({ category: value })}
          options={categories.map((category) => ({ value: category, label: category }))}
        />
        <Select
          label="Ответственный"
          value={values.responsibleId}
          onChange={(value) => update({ responsibleId: value })}
          options={users.map((user) => ({ value: user.id, label: user.name }))}
        />
        <Select
          label="Вид"
          value={values.view}
          onChange={(value) => update({ view: value === "table" ? "table" : "" })}
          options={[
            { value: "cards", label: "Карточки" },
            { value: "table", label: "Таблица" }
          ]}
          emptyLabel="Карточки"
        />
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => update({ low: !values.low })}
            className={`h-10 rounded-md border px-3 text-sm font-medium transition ${
              values.low ? "border-brand bg-brand/10 text-emerald-100" : "border-stroke text-muted hover:text-text"
            }`}
          >
            Низкий остаток
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
  options,
  emptyLabel = "Все"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  emptyLabel?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
      >
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
