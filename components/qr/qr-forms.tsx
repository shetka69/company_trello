"use client";

import Link from "next/link";
import { Download, Printer, Send, Trash2 } from "lucide-react";
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
      setError(response.status === 409 ? "QR-код с таким номером изделия уже существует." : "Не удалось создать QR-код. Проверьте поля и права доступа.");
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

export function QrPrintDownloadActions({
  productNumber,
  qrSvg
}: {
  productNumber: string;
  qrSvg: string;
}) {
  const fileName = `${safeFileName(productNumber)}.svg`;
  const exportSvg = normalizeQrSvg(qrSvg);

  function downloadSvg() {
    const blob = new Blob([exportSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function printQr() {
    const html = `
      <!doctype html>
      <html lang="ru">
        <head>
          <meta charset="utf-8" />
          <title></title>
          <style>
            @page { size: auto; margin: 0; }
            * { box-sizing: border-box; }
            html, body { margin: 0; min-height: 100%; background: #ffffff; }
            body {
              display: grid;
              place-items: center;
              font-family: Arial, sans-serif;
              color: #111827;
            }
            .sheet {
              width: 100%;
              max-width: 360px;
              padding: 14mm;
              text-align: center;
              break-inside: avoid;
            }
            .qr { width: 100%; }
            .qr svg {
              display: block;
              width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <main class="sheet">
            <div class="qr">${exportSvg}</div>
          </main>
          <script>
            setTimeout(() => {
              window.focus();
              window.print();
            }, 250);
          </script>
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank", "width=720,height=840");
    if (!printWindow) return;
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  return (
    <>
      <button
        type="button"
        onClick={printQr}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-stroke px-4 text-sm font-semibold text-muted transition hover:text-text"
      >
        <Printer size={16} />
        Печать
      </button>
      <button
        type="button"
        onClick={downloadSvg}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-stroke px-4 text-sm font-semibold text-muted transition hover:text-text"
      >
        <Download size={16} />
        Скачать SVG
      </button>
    </>
  );
}

export function QrDeleteButton({ codeId }: { codeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (loading) return;
    const confirmed = window.confirm("Удалить QR-код? Паспорт изделия перестанет открываться по этому коду.");
    if (!confirmed) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/qr/codes/${codeId}`, {
      method: "DELETE"
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось удалить QR-код.");
      return;
    }

    router.push("/app/qr");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={remove}
        disabled={loading}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-300/30 px-4 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/10 disabled:opacity-60"
      >
        <Trash2 size={16} />
        {loading ? "Удаление..." : "Удалить"}
      </button>
      {error && <div className="text-sm text-danger">{error}</div>}
    </div>
  );
}

export function QrDeleteRequestButton({ codeId }: { codeId: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function requestDelete() {
    if (loading || sent) return;
    setLoading(true);
    setError("");

    const response = await fetch(`/api/qr/codes/${codeId}/delete-request`, {
      method: "POST"
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось отправить запрос.");
      return;
    }

    window.alert("Запрос отправлен. Ожидайте разрешения разработчика или руководителя.");
    setSent(true);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={requestDelete}
        disabled={loading || sent}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-stroke px-4 text-sm font-semibold text-muted transition hover:text-text disabled:opacity-60"
      >
        <Trash2 size={16} />
        {sent ? "Запрос отправлен" : loading ? "Отправка..." : "Запросить удаление"}
      </button>
      {error && <div className="text-sm text-danger">{error}</div>}
    </div>
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

function safeFileName(value: string) {
  return value.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, "_") || "qr-code";
}

function normalizeQrSvg(value: string) {
  return value.replace(/<svg\b([^>]*)>/g, (match, attributes: string) => {
    const seen = new Set<string>();
    const normalizedAttributes = attributes.replace(/\s([:\w-]+)="[^"]*"/g, (attribute: string, name: string) => {
      if (seen.has(name)) return "";
      seen.add(name);
      return attribute;
    });

    return `<svg${normalizedAttributes}>`;
  });
}
