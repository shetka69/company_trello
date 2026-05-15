"use client";

import Link from "next/link";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Preset = {
  id: string;
  name: string;
};

type QrStatus = "WAITING" | "WAREHOUSE" | "SHIPPED";

export const qrStatusLabels: Record<QrStatus, string> = {
  WAITING: "Ожидает",
  WAREHOUSE: "На складе",
  SHIPPED: "Отправлено"
};

export function ProductPresetForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || loading) return;

    setLoading(true);
    setError("");

    const response = await fetch("/api/qr/presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed })
    });

    setLoading(false);

    if (!response.ok) {
      setError(response.status === 409 ? "Такой пресет уже есть." : "Не удалось добавить пресет.");
      return;
    }

    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="h-10 min-w-0 flex-1 rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
        placeholder="Например: Колонка - BB 28"
      />
      <Button disabled={name.trim().length < 2 || loading}>{loading ? "..." : "Добавить"}</Button>
      {error && <div className="self-center text-sm text-danger">{error}</div>}
    </form>
  );
}

export function QrCodeCreateForm({ presets }: { presets: Preset[] }) {
  const router = useRouter();
  const [productNumber, setProductNumber] = useState("");
  const [productName, setProductName] = useState(presets[0]?.name ?? "");
  const [manufacturedAt, setManufacturedAt] = useState("");
  const [recipient, setRecipient] = useState("Складская позиция");
  const [destination, setDestination] = useState("");
  const [shippingDueAt, setShippingDueAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(
    () => productNumber.trim() && productName.trim().length >= 2 && manufacturedAt && recipient.trim().length >= 2 && destination.trim().length >= 2 && shippingDueAt && !loading,
    [destination, loading, manufacturedAt, productName, productNumber, recipient, shippingDueAt]
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const response = await fetch("/api/qr/codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productNumber: productNumber.trim(),
        productName: productName.trim(),
        manufacturedAt: new Date(manufacturedAt).toISOString(),
        recipient: recipient.trim(),
        destination: destination.trim(),
        shippingDueAt: new Date(shippingDueAt).toISOString()
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось создать QR-код. Проверьте поля и права доступа.");
      return;
    }

    setProductNumber("");
    setManufacturedAt("");
    setRecipient("Складская позиция");
    setDestination("");
    setShippingDueAt("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <TextField label="Номер изделия" value={productNumber} onChange={setProductNumber} placeholder="BB-28-0001" />
        <ComboboxField label="Название изделия" value={productName} onChange={setProductName} options={presets.map((preset) => preset.name)} listId="product-presets" placeholder="Можно выбрать пресет или написать вручную" />
        <DateField label="Дата изготовления" value={manufacturedAt} onChange={setManufacturedAt} />
        <ComboboxField label="Кому едет" value={recipient} onChange={setRecipient} options={["Складская позиция"]} listId="recipient-presets" placeholder="ФИО, компания или Складская позиция" />
        <TextField label="Куда едет" value={destination} onChange={setDestination} placeholder="Адрес, город или склад" />
        <DateField label="Срок отправки" value={shippingDueAt} onChange={setShippingDueAt} />
      </div>
      {error && <div className="text-sm text-danger">{error}</div>}
      <div className="flex justify-end">
        <Button disabled={!canSubmit}>{loading ? "Создание..." : "Создать QR-код"}</Button>
      </div>
    </form>
  );
}

export function QrShipButton({ codeId }: { codeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ship() {
    if (loading) return;
    setLoading(true);
    setError("");

    const response = await fetch(`/api/qr/codes/${codeId}/ship`, {
      method: "PATCH"
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось изменить статус.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={ship}
        disabled={loading}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-surface transition hover:bg-emerald-300 disabled:opacity-60"
      >
        <Send size={16} />
        {loading ? "Отправка..." : "ОТПРАВЛЕНО"}
      </button>
      {error && <div className="text-sm text-danger">{error}</div>}
    </div>
  );
}

export function QrWarehouseButton({ codeId }: { codeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function markWarehouse() {
    if (loading) return;
    setLoading(true);
    setError("");

    const response = await fetch(`/api/qr/codes/${codeId}/warehouse`, {
      method: "PATCH"
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось изменить статус.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={markWarehouse}
        disabled={loading}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-sky-300/30 px-4 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/10 disabled:opacity-60"
      >
        {loading ? "Обновление..." : "НА СКЛАДЕ"}
      </button>
      {error && <div className="text-sm text-danger">{error}</div>}
    </div>
  );
}

export function PublicQrLink({ token }: { token: string }) {
  return (
    <Link href={`/qr/${token}`} className="inline-flex h-9 items-center gap-2 rounded-md border border-stroke px-3 text-sm font-medium text-muted transition hover:text-text">
      Открыть паспорт
    </Link>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
        placeholder={placeholder}
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

function ComboboxField({
  label,
  value,
  onChange,
  options,
  listId,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  listId: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        list={listId}
        className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
        placeholder={placeholder}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </label>
  );
}
