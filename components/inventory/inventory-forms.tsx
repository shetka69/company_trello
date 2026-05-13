"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type UserOption = {
  id: string;
  name: string;
};

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  responsibleId: string | null;
  comments: string | null;
};

type InventoryItemOption = {
  id: string;
  name: string;
  unit: string;
};

type Delivery = {
  id: string;
  title: string;
  supplier: string | null;
  expectedAt: string | null;
  receivedAt: string | null;
  status: string;
};

type TransactionType = "INCOME" | "WRITE_OFF" | "ADJUSTMENT" | "PICKUP";
type DeliveryStatus = "planned" | "in_transit" | "received" | "cancelled";

const transactionTypes: { value: TransactionType; label: string }[] = [
  { value: "INCOME", label: "Приход" },
  { value: "WRITE_OFF", label: "Списание" },
  { value: "PICKUP", label: "Выдача" },
  { value: "ADJUSTMENT", label: "Корректировка" }
];

const deliveryStatuses: { value: DeliveryStatus; label: string }[] = [
  { value: "planned", label: "Запланирована" },
  { value: "in_transit", label: "В пути" },
  { value: "received", label: "Принята" },
  { value: "cancelled", label: "Отменена" }
];

export function InventoryItemCreateForm({ users }: { users: UserOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [unit, setUnit] = useState("шт");
  const [minThreshold, setMinThreshold] = useState("0");
  const [responsibleId, setResponsibleId] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => name.trim().length >= 2 && category.trim().length >= 2 && unit.trim().length >= 1 && !loading, [name, category, unit, loading]);

  const reset = useCallback(() => {
    setName("");
    setCategory("");
    setQuantity("0");
    setUnit("шт");
    setMinThreshold("0");
    setResponsibleId("");
    setComments("");
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

    const response = await fetch("/api/inventory/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        category: category.trim(),
        quantity: numberValue(quantity),
        unit: unit.trim(),
        minThreshold: numberValue(minThreshold),
        responsibleId: responsibleId || null,
        comments: comments.trim() || null
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось создать позицию.");
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
        Новая позиция
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
        <FormHeader title="Новая позиция" onClose={closeCreateForm} />
        <InventoryItemFields
          name={name}
          setName={setName}
          category={category}
          setCategory={setCategory}
          unit={unit}
          setUnit={setUnit}
          minThreshold={minThreshold}
          setMinThreshold={setMinThreshold}
          responsibleId={responsibleId}
          setResponsibleId={setResponsibleId}
          comments={comments}
          setComments={setComments}
          users={users}
          quantity={quantity}
          setQuantity={setQuantity}
        />
        {error && <div className="text-sm text-danger">{error}</div>}
        <div className="flex justify-end gap-2">
          <SecondaryButton onClick={closeCreateForm}>Отмена</SecondaryButton>
          <Button disabled={!canSubmit}>{loading ? "Создание..." : "Создать"}</Button>
        </div>
      </form>
    </div>
  );
}

export function InventoryItemEditForm({ item, users }: { item: InventoryItem; users: UserOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [unit, setUnit] = useState(item.unit);
  const [minThreshold, setMinThreshold] = useState(String(item.minThreshold));
  const [responsibleId, setResponsibleId] = useState(item.responsibleId ?? "");
  const [comments, setComments] = useState(item.comments ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => name.trim().length >= 2 && category.trim().length >= 2 && unit.trim().length >= 1 && !loading, [name, category, unit, loading]);

  function reset() {
    setName(item.name);
    setCategory(item.category);
    setUnit(item.unit);
    setMinThreshold(String(item.minThreshold));
    setResponsibleId(item.responsibleId ?? "");
    setComments(item.comments ?? "");
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/inventory/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        category: category.trim(),
        unit: unit.trim(),
        minThreshold: numberValue(minThreshold),
        responsibleId: responsibleId || null,
        comments: comments.trim() || null
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось сохранить позицию.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-stroke px-3 text-sm font-medium text-muted transition hover:text-text"
      >
        <Pencil size={16} />
        Изменить
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-md border border-stroke bg-panelSoft p-3">
      <FormHeader title="Редактирование" onClose={() => { reset(); setOpen(false); }} />
      <InventoryItemFields
        name={name}
        setName={setName}
        category={category}
        setCategory={setCategory}
        unit={unit}
        setUnit={setUnit}
        minThreshold={minThreshold}
        setMinThreshold={setMinThreshold}
        responsibleId={responsibleId}
        setResponsibleId={setResponsibleId}
        comments={comments}
        setComments={setComments}
        users={users}
      />
      {error && <div className="text-sm text-danger">{error}</div>}
      <div className="flex justify-end gap-2">
        <SecondaryButton onClick={() => { reset(); setOpen(false); }}>Отмена</SecondaryButton>
        <Button disabled={!canSubmit}>{loading ? "Сохранение..." : "Сохранить"}</Button>
      </div>
    </form>
  );
}

export function InventoryItemDeleteButton({ itemId, name }: { itemId: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (loading) return;
    const confirmed = window.confirm(`Удалить складскую позицию "${name}"? История операций и связанные задачи тоже будут удалены или отвязаны.`);
    if (!confirmed) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/inventory/items/${itemId}`, {
      method: "DELETE"
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось удалить позицию.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-3 space-y-2">
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

export function InventoryTransactionForm({ item }: { item: Pick<InventoryItem, "id" | "quantity" | "unit"> }) {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>("INCOME");
  const [quantity, setQuantity] = useState("1");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedQuantity = numberValue(quantity);
    if (parsedQuantity <= 0 || loading) return;

    setLoading(true);
    setError("");

    const response = await fetch("/api/inventory/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId: item.id,
        type,
        quantity: parsedQuantity,
        comment: comment.trim() || undefined
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Операция не выполнена. Проверьте остаток и количество.");
      return;
    }

    setQuantity("1");
    setComment("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-md border border-stroke bg-panelSoft p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_110px]">
        <select
          value={type}
          onChange={(event) => setType(event.target.value as TransactionType)}
          className="h-10 rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
        >
          {transactionTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="h-10 rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
          min={1}
          type="number"
        />
      </div>
      <input
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
        placeholder={`Комментарий, ${item.quantity} ${item.unit} сейчас`}
      />
      {error && <div className="text-sm text-danger">{error}</div>}
      <div className="flex justify-end">
        <Button disabled={loading || numberValue(quantity) <= 0}>{loading ? "Проведение..." : "Провести"}</Button>
      </div>
    </form>
  );
}

export function DeliveryCreateForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [supplier, setSupplier] = useState("");
  const [expectedAt, setExpectedAt] = useState("");
  const [status, setStatus] = useState<DeliveryStatus>("planned");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = title.trim().length >= 2 && !loading;

  const reset = useCallback(() => {
    setTitle("");
    setSupplier("");
    setExpectedAt("");
    setStatus("planned");
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

    const response = await fetch("/api/inventory/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        supplier: supplier.trim() || null,
        expectedAt: expectedAt ? new Date(expectedAt).toISOString() : null,
        status
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось создать поставку.");
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
        className="inline-flex h-10 items-center gap-2 rounded-md border border-stroke px-4 text-sm font-semibold text-muted transition hover:text-text"
      >
        <Plus size={18} />
        Поставка
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
      <FormHeader title="Новая поставка" onClose={closeCreateForm} />
      <DeliveryFields
        title={title}
        setTitle={setTitle}
        supplier={supplier}
        setSupplier={setSupplier}
        expectedAt={expectedAt}
        setExpectedAt={setExpectedAt}
        status={status}
        setStatus={setStatus}
      />
      {error && <div className="text-sm text-danger">{error}</div>}
      <div className="flex justify-end gap-2">
        <SecondaryButton onClick={closeCreateForm}>Отмена</SecondaryButton>
        <Button disabled={!canSubmit}>{loading ? "Создание..." : "Создать"}</Button>
      </div>
      </form>
    </div>
  );
}

export function DeliveryEditForm({ delivery }: { delivery: Delivery }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(delivery.title);
  const [supplier, setSupplier] = useState(delivery.supplier ?? "");
  const [expectedAt, setExpectedAt] = useState(toDateTimeLocalValue(delivery.expectedAt));
  const [status, setStatus] = useState<DeliveryStatus>(normalizeDeliveryStatus(delivery.status));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = title.trim().length >= 2 && !loading;

  function reset() {
    setTitle(delivery.title);
    setSupplier(delivery.supplier ?? "");
    setExpectedAt(toDateTimeLocalValue(delivery.expectedAt));
    setStatus(normalizeDeliveryStatus(delivery.status));
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/inventory/deliveries/${delivery.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        supplier: supplier.trim() || null,
        expectedAt: expectedAt ? new Date(expectedAt).toISOString() : null,
        status
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось сохранить поставку.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="h-9 rounded-md border border-stroke px-3 text-sm font-medium text-muted transition hover:text-text">
        Изменить
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-md border border-stroke bg-panelSoft p-3">
      <FormHeader title="Редактирование поставки" onClose={() => { reset(); setOpen(false); }} />
      <DeliveryFields
        title={title}
        setTitle={setTitle}
        supplier={supplier}
        setSupplier={setSupplier}
        expectedAt={expectedAt}
        setExpectedAt={setExpectedAt}
        status={status}
        setStatus={setStatus}
      />
      {error && <div className="text-sm text-danger">{error}</div>}
      <div className="flex justify-end gap-2">
        <SecondaryButton onClick={() => { reset(); setOpen(false); }}>Отмена</SecondaryButton>
        <Button disabled={!canSubmit}>{loading ? "Сохранение..." : "Сохранить"}</Button>
      </div>
    </form>
  );
}

export function DeliveryReceiveForm({ delivery, items }: { delivery: Delivery; items: InventoryItemOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const selectedItem = items.find((item) => item.id === itemId);
  const canSubmit = Boolean(itemId) && numberValue(quantity) > 0 && !loading;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/inventory/deliveries/${delivery.id}/receive`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemId,
        quantity: numberValue(quantity),
        comment: comment.trim() || undefined
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось принять поставку.");
      return;
    }

    setOpen(false);
    setQuantity("1");
    setComment("");
    router.refresh();
  }

  if (delivery.status === "received" || delivery.status === "cancelled") return null;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="h-9 rounded-md bg-brand px-3 text-sm font-semibold text-surface transition hover:bg-emerald-300">
        Принять
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 rounded-md border border-stroke bg-panelSoft p-3">
      <FormHeader title="Приемка поставки" onClose={() => { setOpen(false); setError(""); }} />
      <label className="block">
        <span className="mb-2 block text-sm text-muted">Ресурс</span>
        <select
          value={itemId}
          onChange={(event) => setItemId(event.target.value)}
          className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
        >
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.unit})
            </option>
          ))}
        </select>
      </label>
      <NumberField label={`Количество${selectedItem ? `, ${selectedItem.unit}` : ""}`} value={quantity} onChange={setQuantity} />
      <TextField label="Комментарий" value={comment} onChange={setComment} />
      {error && <div className="text-sm text-danger">{error}</div>}
      <div className="flex justify-end gap-2">
        <SecondaryButton onClick={() => { setOpen(false); setError(""); }}>Отмена</SecondaryButton>
        <Button disabled={!canSubmit}>{loading ? "Приемка..." : "Принять на склад"}</Button>
      </div>
    </form>
  );
}

export function DeliveryDeleteButton({ deliveryId, title }: { deliveryId: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (loading) return;
    const confirmed = window.confirm(`Удалить поставку "${title}"?`);
    if (!confirmed) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/inventory/deliveries/${deliveryId}`, {
      method: "DELETE"
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось удалить поставку.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={remove}
        disabled={loading}
        className="h-9 rounded-md border border-rose-300/25 px-3 text-sm font-medium text-rose-100 transition hover:bg-rose-300/10 disabled:opacity-60"
      >
        {loading ? "Удаление..." : "Удалить"}
      </button>
      {error && <div className="text-sm text-danger">{error}</div>}
    </div>
  );
}

function InventoryItemFields({
  name,
  setName,
  category,
  setCategory,
  unit,
  setUnit,
  minThreshold,
  setMinThreshold,
  responsibleId,
  setResponsibleId,
  comments,
  setComments,
  users,
  quantity,
  setQuantity
}: {
  name: string;
  setName: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  unit: string;
  setUnit: (value: string) => void;
  minThreshold: string;
  setMinThreshold: (value: string) => void;
  responsibleId: string;
  setResponsibleId: (value: string) => void;
  comments: string;
  setComments: (value: string) => void;
  users: UserOption[];
  quantity?: string;
  setQuantity?: (value: string) => void;
}) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        <TextField label="Название" value={name} onChange={setName} />
        <TextField label="Категория" value={category} onChange={setCategory} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {setQuantity && <NumberField label="Стартовый остаток" value={quantity ?? "0"} onChange={setQuantity} />}
        <TextField label="Единица" value={unit} onChange={setUnit} />
        <NumberField label="Минимум" value={minThreshold} onChange={setMinThreshold} />
      </div>
      <label className="block">
        <span className="mb-2 block text-sm text-muted">Ответственный</span>
        <select
          value={responsibleId}
          onChange={(event) => setResponsibleId(event.target.value)}
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
        <span className="mb-2 block text-sm text-muted">Комментарий</span>
        <textarea
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          className="min-h-20 w-full resize-y rounded-md border border-stroke bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand"
        />
      </label>
    </>
  );
}

function DeliveryFields({
  title,
  setTitle,
  supplier,
  setSupplier,
  expectedAt,
  setExpectedAt,
  status,
  setStatus
}: {
  title: string;
  setTitle: (value: string) => void;
  supplier: string;
  setSupplier: (value: string) => void;
  expectedAt: string;
  setExpectedAt: (value: string) => void;
  status: DeliveryStatus;
  setStatus: (value: DeliveryStatus) => void;
}) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        <TextField label="Название" value={title} onChange={setTitle} />
        <TextField label="Поставщик" value={supplier} onChange={setSupplier} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-muted">Ожидается</span>
          <input
            value={expectedAt}
            onChange={(event) => setExpectedAt(event.target.value)}
            className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
            type="datetime-local"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-muted">Статус</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as DeliveryStatus)}
            className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
          >
            {deliveryStatuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
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

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
        min={0}
        type="number"
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

function numberValue(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.trunc(parsed));
}

function normalizeDeliveryStatus(value: string): DeliveryStatus {
  if (value === "in_transit" || value === "received" || value === "cancelled") return value;
  return "planned";
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
