"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SearchResult = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
};

export function GlobalSearch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal
        });

        if (response.ok) {
          const data = (await response.json()) as { results: SearchResult[] };
          setResults(data.results);
          setOpen(true);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <div className="flex items-center gap-3 rounded-md border border-stroke bg-panel px-3 py-2 text-muted">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          placeholder="Поиск по задачам, складу, сотрудникам и QR-кодам"
        />
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-lg border border-stroke bg-panel shadow-clean">
          <div className="max-h-96 overflow-y-auto p-2">
            {loading && <div className="px-3 py-2 text-sm text-muted">Поиск...</div>}
            {!loading && results.length === 0 && <div className="px-3 py-2 text-sm text-muted">Ничего не найдено</div>}
            {!loading &&
              results.map((result) => (
                <Link
                  key={result.id}
                  href={result.href}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="block rounded-md px-3 py-2 transition hover:bg-panelSoft"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{result.title}</div>
                      <div className="mt-1 truncate text-xs text-muted">{result.subtitle}</div>
                    </div>
                    <span className="shrink-0 rounded-md border border-stroke px-2 py-1 text-xs text-muted">{result.type}</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

