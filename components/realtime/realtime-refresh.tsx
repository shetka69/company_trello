"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 3000;

type VersionPayload = {
  version: string;
};

export function RealtimeRefresh({ initialVersion }: { initialVersion: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const versionRef = useRef(initialVersion);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    versionRef.current = initialVersion;
  }, [initialVersion]);

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }

    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let requestInFlight = false;

    async function checkVersion() {
      if (disposed || requestInFlight || !online || document.visibilityState !== "visible") return;
      requestInFlight = true;

      try {
        const response = await fetch("/api/realtime/version", {
          cache: "no-store",
          headers: { Accept: "application/json" }
        });

        if (!response.ok) return;

        const payload = (await response.json()) as VersionPayload;
        if (!payload.version || payload.version === versionRef.current) return;

        versionRef.current = payload.version;
        scheduleRefresh();
      } catch {
        // Next poll will retry. The UI should stay quiet if the network blips.
      } finally {
        requestInFlight = false;
      }
    }

    function scheduleRefresh() {
      if (refreshTimerRef.current) return;

      refreshTimerRef.current = setTimeout(() => {
        refreshTimerRef.current = null;
        router.refresh();
      }, 250);
    }

    const interval = window.setInterval(checkVersion, POLL_INTERVAL_MS);
    void checkVersion();

    return () => {
      disposed = true;
      window.clearInterval(interval);
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [online, pathname, router]);

  return null;
}
