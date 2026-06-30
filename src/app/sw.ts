import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// Web Push event handler
self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const { title, body, maintenanceId, tag, url } = payload;

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        tag: tag || "pessoauto-maintenance",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        data: { maintenanceId, url },
        requireInteraction: true,
      } as NotificationOptions),
    );
  } catch {
    // fallback: plain text
    event.waitUntil(
      self.registration.showNotification("PessoAuto", {
        body: event.data.text(),
        icon: "/icons/icon-192x192.png",
      }),
    );
  }
});

// Notification click handler — navigate to maintenance detail
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const maintenanceId = event.notification.data?.maintenanceId;
  const target = event.notification.data?.url || (maintenanceId
    ? `/maintenances/${maintenanceId}`
    : "/maintenances");

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) {
        existing.focus();
        existing.postMessage({ type: "navigate", url: target });
      } else {
        self.clients.openWindow(target);
      }
    }),
  );
});
