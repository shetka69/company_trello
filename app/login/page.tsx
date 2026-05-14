"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Неверный email или пароль");
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-stroke bg-panel p-6 shadow-clean">
        <div className="mb-6">
          <div className="text-2xl font-semibold tracking-tight">Вход в систему</div>
          <p className="mt-2 text-sm text-muted">Единое рабочее пространство команды</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-muted">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
              type="email"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-muted">Пароль</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
              type="password"
              autoComplete="current-password"
            />
          </label>
          {error && <div className="rounded-md border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">{error}</div>}
          <Button disabled={loading} className="w-full">
            {loading ? "Вход..." : "Войти"}
          </Button>
        </form>
      </section>
    </main>
  );
}
