"use client";

import type { IScannerControls } from "@zxing/browser";
import { Camera, Keyboard, ScanLine, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function QrScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState("");

  useEffect(() => {
    return () => stopScanner();
  }, []);

  async function startScanner() {
    if (!videoRef.current || scanning) return;

    setError("");
    setLastResult("");
    setScanning(true);

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        videoRef.current,
        (result) => {
          const text = result?.getText();
          if (!text) return;
          setLastResult(text);
          const target = parseQrTarget(text);
          if (!target) {
            setError("QR-код прочитан, но это не код изделия из этой системы.");
            return;
          }
          stopScanner();
          router.push(target);
        }
      );
      controlsRef.current = controls;
    } catch {
      setScanning(false);
      setError("Не удалось открыть камеру. Проверьте разрешение браузера или вставьте ссылку вручную.");
    }
  }

  function stopScanner() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  }

  async function openManual() {
    const trimmed = manualValue.trim();
    const localTarget = parseQrTarget(trimmed);
    if (localTarget) {
      router.push(localTarget);
      return;
    }

    setError("");
    const response = await fetch(`/api/qr/resolve?value=${encodeURIComponent(trimmed)}`);
    if (!response.ok) {
      setError("Код или номер изделия не найден.");
      return;
    }

    const data = (await response.json()) as { href?: string };
    if (!data.href) {
      setError("Код или номер изделия не найден.");
      return;
    }

    router.push(data.href);
  }

  return (
    <div className="rounded-md border border-stroke bg-surface p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-2 text-base font-semibold">
            <ScanLine size={20} className="text-brand" />
            Сканер QR-кодов
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            На телефоне можно открыть камеру и отсканировать QR-код. На компьютере используйте ручной ввод ссылки, токена или номера изделия.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:hidden">
          {!scanning ? (
            <Button type="button" onClick={startScanner} className="gap-2">
              <Camera size={16} />
              Сканировать
            </Button>
          ) : (
            <button
              type="button"
              onClick={stopScanner}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-stroke px-4 text-sm font-semibold text-muted transition hover:text-text"
            >
              <X size={16} />
              Закрыть камеру
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-1 lg:grid-cols-[minmax(0,520px)]">
        <div className="overflow-hidden rounded-md border border-stroke bg-panel md:hidden">
          <video ref={videoRef} className="aspect-[4/3] w-full bg-black object-cover" muted playsInline />
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-sm text-muted">Ручной ввод, если камера недоступна</span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={manualValue}
                onChange={(event) => setManualValue(event.target.value)}
                className="h-10 min-w-0 flex-1 rounded-md border border-stroke bg-panel px-3 text-sm outline-none transition focus:border-brand"
                placeholder="Ссылка /qr/..., токен или номер изделия"
              />
              <button
                type="button"
                onClick={openManual}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stroke px-4 text-sm font-semibold text-muted transition hover:text-text"
              >
                <Keyboard size={16} />
                Открыть
              </button>
            </div>
          </label>

          {lastResult && (
            <div className="rounded-md bg-panel px-3 py-2 text-sm text-muted">
              Прочитано: <span className="break-all text-text">{lastResult}</span>
            </div>
          )}
          {error && <div className="rounded-md border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">{error}</div>}
        </div>
      </div>
    </div>
  );
}

function parseQrTarget(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const path = extractPath(trimmed);
  const match = path.match(/^\/qr\/([a-zA-Z0-9_-]+)$/);
  if (match?.[1]) return `/qr/${match[1]}`;

  if (/^[a-zA-Z0-9_-]{12,}$/.test(trimmed)) {
    return `/qr/${trimmed}`;
  }

  return null;
}

function extractPath(value: string) {
  try {
    return new URL(value).pathname;
  } catch {
    return value.startsWith("/") ? value : `/${value}`;
  }
}
