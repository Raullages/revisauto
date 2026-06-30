"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ServiceWorkerNavigationProvider() {
  const router = useRouter();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const handleMessage = (event: MessageEvent<{ type?: string; url?: string }>) => {
      if (event.data?.type === "navigate" && event.data.url) {
        router.push(event.data.url);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [router]);

  return null;
}
