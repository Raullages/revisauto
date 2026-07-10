"use client";

import { useEffect, useRef } from "react";
import { useFuelStationReminder } from "@/hooks/useFuelStationReminder";
import { getDistanceInMeters } from "@/lib/geo";
import { saveReminderDebugState } from "@/lib/mobile/reminder-debug";
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
  accuracy: number;
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
  const stopTimeoutRef = useRef<number | null>(null);

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
    const clearStopTimeout = () => {
      if (stopTimeoutRef.current !== null) {
        window.clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
    };

    const setStopCandidate = (candidate: StopCandidate | null) => {
      stopCandidateRef.current = candidate;

      clearStopTimeout();

      if (!candidate || candidate.evaluated) {
        return;
      }

      const remainingMs = Math.max(0, MIN_STOPPED_SECONDS * 1000 - (Date.now() - candidate.startedAt));

      stopTimeoutRef.current = window.setTimeout(() => {
        const currentCandidate = stopCandidateRef.current;

        if (!currentCandidate || currentCandidate.evaluated || currentCandidate.startedAt !== candidate.startedAt) {
          return;
        }

        void evaluateStop(currentCandidate);
      }, remainingMs);
    };

    const evaluateStop = async (candidate: StopCandidate) => {
      if (checkingRef.current) {
        return;
      }

      const currentCandidate = stopCandidateRef.current;
      if (!currentCandidate || currentCandidate.evaluated || currentCandidate.startedAt !== candidate.startedAt) {
        return;
      }

      const stoppedForSeconds = Math.floor((Date.now() - candidate.startedAt) / 1000);
      if (stoppedForSeconds < MIN_STOPPED_SECONDS) {
        saveReminderDebugState({
          checkedAt: new Date().toISOString(),
          status: "watching",
          reason: "waiting_min_stopped_time",
          latitude: candidate.latitude,
          longitude: candidate.longitude,
          accuracy: candidate.accuracy,
          stoppedForSeconds,
        });
        setStopCandidate(candidate);
        return;
      }

      checkingRef.current = true;
      setStopCandidate({ ...candidate, evaluated: true });

      try {
        const response = await fetch("/api/fuel-stations/should-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: candidate.latitude,
            lng: candidate.longitude,
            accuracy: candidate.accuracy,
            stoppedForSeconds,
          }),
        });

        const payload = (await response.json()) as ShouldNotifyResponse & { error?: string };

        if (!response.ok || !payload.shouldNotify || !payload.notification) {
          saveReminderDebugState({
            checkedAt: new Date().toISOString(),
            status: response.ok ? "skipped" : "error",
            reason: payload.reason ?? (response.ok ? "notification_not_sent" : "request_failed"),
            latitude: candidate.latitude,
            longitude: candidate.longitude,
            accuracy: candidate.accuracy,
            stoppedForSeconds,
            details: payload.error,
          });
          return;
        }

        await showReminderNotification(payload.notification);
        saveReminderDebugState({
          checkedAt: new Date().toISOString(),
          status: "notified",
          reason: payload.reason ?? "station_nearby",
          latitude: candidate.latitude,
          longitude: candidate.longitude,
          accuracy: candidate.accuracy,
          stoppedForSeconds,
        });
        reminder.refresh();
      } catch {
        saveReminderDebugState({
          checkedAt: new Date().toISOString(),
          status: "error",
          reason: "request_exception",
          latitude: candidate.latitude,
          longitude: candidate.longitude,
          accuracy: candidate.accuracy,
          stoppedForSeconds,
        });
        setStopCandidate({ ...candidate, evaluated: true });
      } finally {
        checkingRef.current = false;
      }
    };

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
      saveReminderDebugState({
        checkedAt: new Date().toISOString(),
        status: "skipped",
        reason: reminder.loading
          ? "reminder_loading"
          : !reminder.isSupported
            ? "reminder_unsupported"
            : !reminder.preferences.fuel_station_reminders_enabled
              ? "feature_disabled"
              : reminder.preferences.location_permission_status !== "granted"
                ? "location_permission_not_granted"
                : "push_permission_not_granted",
      });
      setStopCandidate(null);
      checkingRef.current = false;
      return;
    }

    void (async () => {
      watchIdRef.current = await watchDevicePosition(
        {
          enableHighAccuracy: true,
          maximumAge: 15000,
          timeout: 20000,
        },
        (position) => {
          if (position.coords.accuracy > MAX_ACCURACY_METERS) {
            saveReminderDebugState({
              checkedAt: new Date().toISOString(),
              status: "skipped",
              reason: "accuracy_too_low_before_check",
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
            return;
          }

          if (typeof position.coords.speed === "number" && position.coords.speed > MOVING_SPEED_MPS) {
            saveReminderDebugState({
              checkedAt: new Date().toISOString(),
              status: "watching",
              reason: "moving",
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
            setStopCandidate(null);
            return;
          }

          const candidate = stopCandidateRef.current;
          if (!candidate) {
            saveReminderDebugState({
              checkedAt: new Date().toISOString(),
              status: "watching",
              reason: "stop_candidate_started",
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              stoppedForSeconds: 0,
            });
            setStopCandidate({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              startedAt: Date.now(),
              evaluated: false,
            });
            return;
          }

          const distanceFromAnchor = getDistanceInMeters(
            candidate.latitude,
            candidate.longitude,
            position.coords.latitude,
            position.coords.longitude,
          );

          if (distanceFromAnchor > RESET_STOP_RADIUS_METERS) {
            saveReminderDebugState({
              checkedAt: new Date().toISOString(),
              status: "watching",
              reason: "stop_candidate_reset",
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
            setStopCandidate({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              startedAt: Date.now(),
              evaluated: false,
            });
            return;
          }

          if (distanceFromAnchor <= MIN_STOP_RADIUS_METERS) {
            const nextCandidate = {
              ...candidate,
              accuracy: position.coords.accuracy,
            };

            setStopCandidate(nextCandidate);
            void evaluateStop(nextCandidate);
            return;
          }

          setStopCandidate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            startedAt: Date.now(),
            evaluated: false,
          });
        },
        () => {
          saveReminderDebugState({
            checkedAt: new Date().toISOString(),
            status: "error",
            reason: "watch_position_error",
          });
          setStopCandidate(null);
        },
      );
    })();

    return () => {
      if (watchIdRef.current !== null) {
        void clearDeviceWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setStopCandidate(null);
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
