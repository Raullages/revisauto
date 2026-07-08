import { Capacitor, type PermissionState, type PluginListenerHandle } from "@capacitor/core";
import {
  Geolocation,
  type CallbackID,
  type Position,
  type PositionOptions,
} from "@capacitor/geolocation";
import { LocalNotifications } from "@capacitor/local-notifications";

export type LocationPermissionStatus = "prompt" | "granted" | "denied" | "unsupported";
export type PushPermissionStatus = NotificationPermission | "unsupported";

type ReminderNotification = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

function isNativeApp() {
  return Capacitor.isNativePlatform();
}

function mapPermissionState(state: PermissionState): "granted" | "prompt" | "denied" {
  if (state === "granted") {
    return "granted";
  }

  if (state === "denied") {
    return "denied";
  }

  return "prompt";
}

function mapNotificationPermission(state: PermissionState): NotificationPermission {
  if (state === "granted") {
    return "granted";
  }

  if (state === "denied") {
    return "denied";
  }

  return "default";
}

export function isReminderSupported() {
  if (typeof window === "undefined") {
    return false;
  }

  return isNativeApp() || "geolocation" in navigator;
}

export async function getLocationPermissionStatus(): Promise<LocationPermissionStatus> {
  if (isNativeApp()) {
    const status = await Geolocation.checkPermissions();
    return mapPermissionState(status.location);
  }

  if (!("geolocation" in navigator)) {
    return "unsupported";
  }

  if (!("permissions" in navigator) || typeof navigator.permissions.query !== "function") {
    return "prompt";
  }

  try {
    const result = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });

    if (result.state === "granted" || result.state === "denied") {
      return result.state;
    }

    return "prompt";
  } catch {
    return "prompt";
  }
}

export async function requestLocationPermission(): Promise<LocationPermissionStatus> {
  if (isNativeApp()) {
    const status = await Geolocation.requestPermissions();
    return mapPermissionState(status.location);
  }

  if (!("geolocation" in navigator)) {
    return "unsupported";
  }

  try {
    await requestCurrentPosition();
    return "granted";
  } catch {
    return await getLocationPermissionStatus();
  }
}

export async function getPushPermissionStatus(): Promise<PushPermissionStatus> {
  if (isNativeApp()) {
    const status = await LocalNotifications.checkPermissions();
    return mapNotificationPermission(status.display);
  }

  if (!("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export async function requestPushPermission(): Promise<PushPermissionStatus> {
  if (isNativeApp()) {
    const status = await LocalNotifications.requestPermissions();
    return mapNotificationPermission(status.display);
  }

  if (!("Notification" in window)) {
    return "unsupported";
  }

  return await Notification.requestPermission();
}

export async function requestCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition | Position> {
  if (isNativeApp()) {
    return await Geolocation.getCurrentPosition(options);
  }

  return await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options,
    });
  });
}

export async function watchDevicePosition(
  options: PositionOptions,
  onPosition: (position: GeolocationPosition | Position) => void,
  onError: () => void,
): Promise<string> {
  if (isNativeApp()) {
    return await Geolocation.watchPosition(options, (position, err) => {
      if (!position || err) {
        onError();
        return;
      }

      onPosition(position);
    });
  }

  return String(
    navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 15000,
      timeout: 20000,
      ...options,
    }),
  );
}

export async function clearDeviceWatch(id: string) {
  if (isNativeApp()) {
    await Geolocation.clearWatch({ id: id as CallbackID });
    return;
  }

  navigator.geolocation.clearWatch(Number(id));
}

export async function showReminderNotification(notification: ReminderNotification) {
  if (isNativeApp()) {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title: notification.title,
          body: notification.body,
          extra: { url: notification.url },
        },
      ],
    });
    return;
  }

  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(notification.title, {
      body: notification.body,
      tag: notification.tag ?? "fuel-reminder",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: { url: notification.url },
      requireInteraction: true,
    });
    return;
  }

  const browserNotification = new Notification(notification.title, {
    body: notification.body,
    tag: notification.tag,
  });

  browserNotification.onclick = () => {
    window.focus();
    window.location.href = notification.url;
  };
}

export async function addReminderNotificationListener(): Promise<PluginListenerHandle | null> {
  if (!isNativeApp()) {
    return null;
  }

  return await LocalNotifications.addListener("localNotificationActionPerformed", ({ notification }) => {
    const url = typeof notification.extra?.url === "string" ? notification.extra.url : null;

    if (url) {
      window.location.href = url;
    }
  });
}
