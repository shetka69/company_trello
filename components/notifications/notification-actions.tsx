"use client";

import { Check, CheckCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NotificationReadButton({ notificationId }: { notificationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markRead() {
    if (loading) return;
    setLoading(true);

    const response = await fetch("/api/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId })
    });

    setLoading(false);

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={markRead}
      disabled={loading}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-stroke px-3 text-sm font-medium text-muted transition hover:text-text disabled:opacity-60"
    >
      <Check size={16} />
      Прочитано
    </button>
  );
}

export function NotificationReadAllButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markAllRead() {
    if (loading || disabled) return;
    setLoading(true);

    const response = await fetch("/api/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true })
    });

    setLoading(false);

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={markAllRead}
      disabled={disabled || loading}
      className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-surface transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <CheckCheck size={18} />
      {loading ? "Обновление..." : "Прочитать все"}
    </button>
  );
}

export function NotificationDeleteButton({ notificationId }: { notificationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function removeNotification() {
    if (loading) return;
    setLoading(true);

    const response = await fetch("/api/notifications/read", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId })
    });

    setLoading(false);

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={removeNotification}
      disabled={loading}
      aria-label="Удалить уведомление"
      title="Удалить уведомление"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-stroke text-muted transition hover:border-rose-300/40 hover:text-rose-100 disabled:opacity-60"
    >
      <X size={16} />
    </button>
  );
}
