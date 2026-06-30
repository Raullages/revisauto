"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LocationPermissionStatus = "prompt" | "granted" | "denied" | "unsupported";
type PushPermissionStatus = NotificationPermission | "unsupported";

type ReminderPreferences = {
  fuel_station_reminders_enabled: boolean;
  location_permission_status: LocationPermissionStatus;
  push_permission_status: PushPermissionStatus;
  last_fuel_reminder_at: string | null;
  last_fuel_reminder_lat: number | null;
  last_fuel_reminder_lng: number | null;
};

const defaultPreferences: ReminderPreferences = {
  fuel_station_reminders_enabled: false,
  location_permission_status: "prompt",
  push_permission_status: "unsupported",
  last_fuel_reminder_at: null,
  last_fuel_reminder_lat: null,
  last_fuel_reminder_lng: null,
};

async function getLocationPermissionStatus(): Promise<LocationPermissionStatus> {
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

function getPushPermissionStatus(): PushPermissionStatus {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

function requestCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

export function useFuelStationReminder() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [preferences, setPreferences] = useState<ReminderPreferences>(defaultPreferences);

  const persistPreferences = useCallback(async (partial: Partial<ReminderPreferences>) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Não autenticado");
    }

    const { error } = await supabase
      .from("profiles")
      .update(partial)
      .eq("id", user.id);

    if (error) {
      throw error;
    }

    setPreferences((current) => ({ ...current, ...partial }));
  }, []);

  const syncPermissions = useCallback(async () => {
    const location_permission_status = await getLocationPermissionStatus();
    const push_permission_status = getPushPermissionStatus();

    setPreferences((current) => ({
      ...current,
      location_permission_status,
      push_permission_status,
    }));

    return { location_permission_status, push_permission_status };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setIsSupported(typeof window !== "undefined" && "geolocation" in navigator);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setPreferences(defaultPreferences);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("fuel_station_reminders_enabled, location_permission_status, push_permission_status, last_fuel_reminder_at, last_fuel_reminder_lat, last_fuel_reminder_lng")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      }

      const browserPermissions = await syncPermissions();

      setPreferences({
        fuel_station_reminders_enabled: data.fuel_station_reminders_enabled,
        location_permission_status: browserPermissions.location_permission_status,
        push_permission_status: browserPermissions.push_permission_status,
        last_fuel_reminder_at: data.last_fuel_reminder_at,
        last_fuel_reminder_lat: data.last_fuel_reminder_lat,
        last_fuel_reminder_lng: data.last_fuel_reminder_lng,
      });

      if (
        data.location_permission_status !== browserPermissions.location_permission_status ||
        data.push_permission_status !== browserPermissions.push_permission_status
      ) {
        await persistPreferences(browserPermissions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar lembrete inteligente");
    } finally {
      setLoading(false);
    }
  }, [persistPreferences, syncPermissions]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const requestLocationPermission = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      const next = { location_permission_status: "unsupported" as const };
      await persistPreferences(next);
      return next.location_permission_status;
    }

    setSaving(true);
    setError(null);

    try {
      await requestCurrentPosition();
      const next = { location_permission_status: "granted" as const };
      await persistPreferences(next);
      return next.location_permission_status;
    } catch {
      const next = {
        location_permission_status: await getLocationPermissionStatus(),
      };
      await persistPreferences(next);
      return next.location_permission_status;
    } finally {
      setSaving(false);
    }
  }, [persistPreferences]);

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      const next = { push_permission_status: "unsupported" as const };
      await persistPreferences(next);
      return next.push_permission_status;
    }

    setSaving(true);
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      const next = { push_permission_status: permission };
      await persistPreferences(next);
      return next.push_permission_status;
    } finally {
      setSaving(false);
    }
  }, [persistPreferences]);

  const setEnabled = useCallback(async (enabled: boolean) => {
    setSaving(true);
    setError(null);

    try {
      let locationStatus = preferences.location_permission_status;

      if (enabled && locationStatus !== "granted") {
        locationStatus = await requestLocationPermission();
      }

      const nextEnabled = enabled && locationStatus === "granted";

      await persistPreferences({
        fuel_station_reminders_enabled: nextEnabled,
        location_permission_status: locationStatus,
      });

      if (enabled && !nextEnabled) {
        setError("Permita a localização para ativar o lembrete inteligente.");
      }

      return nextEnabled;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar lembrete inteligente");
      return false;
    } finally {
      setSaving(false);
    }
  }, [persistPreferences, preferences.location_permission_status, requestLocationPermission]);

  return {
    loading,
    saving,
    error,
    isSupported,
    preferences,
    refresh,
    setEnabled,
    requestLocationPermission,
    requestNotificationPermission,
  };
}
