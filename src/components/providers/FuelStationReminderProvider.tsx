"use client";

import { useEffect, useRef } from "react";
import { useFuelStationReminder } from "@/hooks/useFuelStationReminder";
import { getDistanceInMeters } from "@/lib/geo";
import type { Position } from "@capacitor/geolocation";
import {
  addReminderNotificationListener,
  clearDeviceWatch,
  showReminderNotification,
  watchDevicePosition,
} from "@/lib/mobile/reminder";

const MIN_STOP_RADIUS_METERS = 30;
const RESET_STOP_RADIUS_METERS = 50;
const MAX_ACCURACY_METERS = 100;
const MIN_STOPPED_SECONDS = 90;
const MOVING_SPEED_MPS = 1.5;

type StopCandidate = {
  latitude: number;
  longitude: number;
  startedAt: number;
  evaluated: boolean;
};

type ShouldNotifyResponse = {
  shouldNotify: boolean;
  reason?: string;
  notification?: {
    title: string;
    body: string;
    url: string;
    tag?: string;
  };
};

export function FuelStationReminderProvider() {
  const reminder = useFuelStationReminder();
  const watchIdRef = useRef<string | null>(null);
  const checkingRef = useRef(false);
  const stopCandidateRef = useRef<StopCandidate | null>(null);

  useEffect(() => {
    let listenerHandle: { remove: () => Promise<void> } | null = null;

    void (async () => {
      listenerHandle = await addReminderNotificationListener();
    })();

    return () => {
      void listenerHandle?.remove();
    };
  }, []);

  useEffect(() => {
    if (
      reminder.loading ||
      !reminder.isSupported ||
      !reminder.preferences.fuel_station_reminders_enabled ||
      reminder.preferences.location_permission_status !== "granted" ||
      reminder.preferences.push_permission_status !== "granted"
    ) {
      if (watchIdRef.current !== null) {
        void clearDeviceWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      stopCandidateRef.current = null;
      checkingRef.current = false;
      return;
    }

    const evaluateStop = async (position: GeolocationPosition | Position) => {
      if (checkingRef.current) {
        return;
      }

      const candidate = stopCandidateRef.current;
      if (!candidate || candidate.evaluated) {
        return;
      }

      const stoppedForSeconds = Math.floor((Date.now() - candidate.startedAt) / 1000);
      if (stoppedForSeconds < MIN_STOPPED_SECONDS) {
        return;
      }

      checkingRef.current = true;

      try {
        const response = await fetch("/api/fuel-stations/should-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            stoppedForSeconds,
          }),
        });

        const payload = (await response.json()) as ShouldNotifyResponse & { error?: string };
        stopCandidateRef.current = { ...candidate, evaluated: true };

        if (!response.ok || !payload.shouldNotify || !payload.notification) {
          return;
        }

        await showReminderNotification(payload.notification);
        reminder.refresh();
      } catch {
        stopCandidateRef.current = { ...candidate, evaluated: true };
      } finally {
        checkingRef.current = false;
      }
    };

    void (async () => {
      watchIdRef.current = await watchDevicePosition(
        {
          enableHighAccuracy: true,
          maximumAge: 15000,
          timeout: 20000,
        },
        (position) => {
          if (position.coords.accuracy > MAX_ACCURACY_METERS) {
            return;
          }

          if (typeof position.coords.speed === "number" && position.coords.speed > MOVING_SPEED_MPS) {
            stopCandidateRef.current = null;
            return;
          }

          const candidate = stopCandidateRef.current;
          if (!candidate) {
            stopCandidateRef.current = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              startedAt: Date.now(),
              evaluated: false,
            };
            return;
          }

          const distanceFromAnchor = getDistanceInMeters(
            candidate.latitude,
            candidate.longitude,
            position.coords.latitude,
            position.coords.longitude,
          );

          if (distanceFromAnchor > RESET_STOP_RADIUS_METERS) {
            stopCandidateRef.current = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              startedAt: Date.now(),
              evaluated: false,
            };
            return;
          }

          if (distanceFromAnchor <= MIN_STOP_RADIUS_METERS) {
            void evaluateStop(position);
            return;
          }

          stopCandidateRef.current = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            startedAt: Date.now(),
            evaluated: false,
          };
        },
        () => {
          stopCandidateRef.current = null;
        },
      );
    })();

    return () => {
      if (watchIdRef.current !== null) {
        void clearDeviceWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      stopCandidateRef.current = null;
      checkingRef.current = false;
    };
  }, [
    reminder,
    reminder.isSupported,
    reminder.loading,
    reminder.preferences.fuel_station_reminders_enabled,
    reminder.preferences.location_permission_status,
    reminder.preferences.push_permission_status,
  ]);

  return null;
}
