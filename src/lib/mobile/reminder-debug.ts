export const REMINDER_DEBUG_STORAGE_KEY = "fuel-station-reminder-debug";

export type ReminderDebugState = {
  checkedAt: string;
  status: "watching" | "skipped" | "notified" | "error";
  reason: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  stoppedForSeconds?: number;
  details?: string;
};

export function saveReminderDebugState(state: ReminderDebugState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(REMINDER_DEBUG_STORAGE_KEY, JSON.stringify(state));
}

export function loadReminderDebugState(): ReminderDebugState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(REMINDER_DEBUG_STORAGE_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as ReminderDebugState;
  } catch {
    return null;
  }
}
