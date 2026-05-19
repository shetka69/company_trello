"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type VersionPayload = {
  version: string;
};

export function RealtimeRefresh({ initialVersion }: { initialVersion: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const versionRef = useRef(initialVersion);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [online, setOnline] = useState(true);
  const [visible, setVisible] = useState(true);

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

    function handleVisibilityChange() {
      setVisible(document.visibilityState === "visible");
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    setOnline(navigator.onLine);
    handleVisibilityChange();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!online || !visible) return;

    const events = new EventSource("/api/realtime/stream");

    function scheduleRefresh() {
      if (refreshTimerRef.current) return;

      refreshTimerRef.current = setTimeout(() => {
        refreshTimerRef.current = null;
        router.refresh();
      }, 250);
    }

    function handleVersion(event: MessageEvent<string>) {
      try {
        const payload = JSON.parse(event.data) as VersionPayload;
        if (!payload.version || payload.version === versionRef.current) return;

        versionRef.current = payload.version;
        scheduleRefresh();
      } catch {
        // Ignore malformed realtime messages. EventSource will stay connected.
      }
    }

    events.addEventListener("version", handleVersion);

    return () => {
      events.removeEventListener("version", handleVersion);
      events.close();

      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [online, pathname, router, visible]);

  return null;
}
