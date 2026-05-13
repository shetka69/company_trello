"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type CalendarEventType = "EVENT" | "REMINDER";

type UserOption = {
  id: string;
  name: string;
};

type EditableEvent = {
  id: string;
  type: CalendarEventType;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  assigneeId: string | null;
};

const typeOptions: { value: CalendarEventType; label: string }[] = [
  { value: "EVENT", label: "Событие" },
  { value: "REMINDER", label: "Напоминание" }
];

export function CalendarEventCreateForm({ users }: { users: UserOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<CalendarEventType>("EVENT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState(toDateTimeLocalValue(new Date().toISOString()));
  const [endsAt, setEndsAt] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => title.trim().length >= 2 && startsAt && !loading, [title, startsAt, loading]);

  const reset = useCallback(() => {
    setType("EVENT");
    setTitle("");
    setDescription("");
    setStartsAt(toDateTimeLocalValue(new Date().toISOString()));
    setEndsAt("");
    setAssigneeId("");
    setError("");
  }, []);

  const closeCreateForm = useCallback(() => {
    reset();
    setOpen(false);
  }, [reset]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(keyEvent: KeyboardEvent) {
      if (keyEvent.key === "Escape") closeCreateForm();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeCreateForm, open]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const response = await fetch("/api/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title: title.trim(),
        description: description.trim() || null,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        assigneeId: assigneeId || null
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось создать событие.");
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
        Новое событие
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={closeCreateForm}>
      <form
        onSubmit={submit}
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl space-y-4 overflow-y-auto rounded-lg border border-stroke bg-panel p-5 shadow-2xl"
      >
        <FormHeader title="Новое событие" onClose={() => { reset(); setOpen(false); }} />
        <EventFields
          type={type}
          setType={setType}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          startsAt={startsAt}
          setStartsAt={setStartsAt}
          endsAt={endsAt}
          setEndsAt={setEndsAt}
          assigneeId={assigneeId}
          setAssigneeId={setAssigneeId}
          users={users}
        />
        {error && <div className="text-sm text-danger">{error}</div>}
        <div className="flex justify-end gap-2">
          <SecondaryButton onClick={() => { reset(); setOpen(false); }}>Отмена</SecondaryButton>
          <Button disabled={!canSubmit}>{loading ? "Создание..." : "Создать"}</Button>
        </div>
      </form>
    </div>
  );
}

export function CalendarEventEditForm({ event, users }: { event: EditableEvent; users: UserOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<CalendarEventType>(event.type);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? "");
  const [startsAt, setStartsAt] = useState(toDateTimeLocalValue(event.startsAt));
  const [endsAt, setEndsAt] = useState(toDateTimeLocalValue(event.endsAt));
  const [assigneeId, setAssigneeId] = useState(event.assigneeId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => title.trim().length >= 2 && startsAt && !loading, [title, startsAt, loading]);

  const reset = useCallback(() => {
    setType(event.type);
    setTitle(event.title);
    setDescription(event.description ?? "");
    setStartsAt(toDateTimeLocalValue(event.startsAt));
    setEndsAt(toDateTimeLocalValue(event.endsAt));
    setAssigneeId(event.assigneeId ?? "");
    setError("");
  }, [event]);

  const closeEditor = useCallback(() => {
    reset();
    setOpen(false);
  }, [reset]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(keyEvent: KeyboardEvent) {
      if (keyEvent.key === "Escape") closeEditor();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeEditor, open]);

  async function submit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/calendar/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title: title.trim(),
        description: description.trim() || null,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        assigneeId: assigneeId || null
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось сохранить событие.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  async function remove() {
    if (loading) return;
    const confirmed = window.confirm(`Удалить событие "${event.title}"?`);
    if (!confirmed) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/calendar/events/${event.id}`, {
      method: "DELETE"
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось удалить событие.");
      return;
    }

    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1 rounded-md border border-stroke px-2 text-xs font-medium text-muted transition hover:text-text"
      >
        <Pencil size={14} />
        Изменить
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={closeEditor}>
      <form
        onSubmit={submit}
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl space-y-4 overflow-y-auto rounded-lg border border-stroke bg-panel p-5 shadow-2xl"
      >
      <FormHeader title="Редактирование" onClose={() => { reset(); setOpen(false); }} />
      <EventFields
        type={type}
        setType={setType}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        startsAt={startsAt}
        setStartsAt={setStartsAt}
        endsAt={endsAt}
        setEndsAt={setEndsAt}
        assigneeId={assigneeId}
        setAssigneeId={setAssigneeId}
        users={users}
      />
      {error && <div className="text-sm text-danger">{error}</div>}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={remove}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-300/25 px-3 text-sm font-medium text-rose-100 transition hover:bg-rose-300/10 disabled:opacity-60"
        >
          <Trash2 size={16} />
          Удалить
        </button>
        <SecondaryButton onClick={() => { reset(); setOpen(false); }}>Отмена</SecondaryButton>
        <Button disabled={!canSubmit}>{loading ? "Сохранение..." : "Сохранить"}</Button>
      </div>
      </form>
    </div>
  );
}

function EventFields({
  type,
  setType,
  title,
  setTitle,
  description,
  setDescription,
  startsAt,
  setStartsAt,
  endsAt,
  setEndsAt,
  assigneeId,
  setAssigneeId,
  users
}: {
  type: CalendarEventType;
  setType: (value: CalendarEventType) => void;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  startsAt: string;
  setStartsAt: (value: string) => void;
  endsAt: string;
  setEndsAt: (value: string) => void;
  assigneeId: string;
  setAssigneeId: (value: string) => void;
  users: UserOption[];
}) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-muted">Тип</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as CalendarEventType)}
            className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <TextField label="Название" value={title} onChange={setTitle} />
        <DateField label="Начало" value={startsAt} onChange={setStartsAt} />
        <DateField label="Окончание" value={endsAt} onChange={setEndsAt} />
      </div>
      <label className="block">
        <span className="mb-2 block text-sm text-muted">Исполнитель</span>
        <select
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
          className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
        >
          <option value="">Не назначен</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-muted">Описание</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-20 w-full resize-y rounded-md border border-stroke bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand"
        />
      </label>
    </>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
      />
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

function toDateTimeLocalValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
