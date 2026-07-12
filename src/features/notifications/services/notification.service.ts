import { authService } from "@/features/auth/services/auth.service";
import { createClient } from "@/lib/supabase/client";
import type { DashboardData } from "@/features/dashboard/services/dashboard.service";
import type { AppNotification } from "../model/types";

const DERIVED_READ_STORAGE_KEY = "app-notification-read-state:v1";

type StoredNotificationRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
  maintenance_id: string | null;
};

function buildDerivedNotificationId(prefix: string, id: string) {
  return `${prefix}:${id}`;
}

function formatMaintenanceSubtitle(
  vehicleLabel: string,
  nextChangeDate?: string | null,
  nextChangeKm?: number | null,
) {
  const meta: string[] = [];

  if (nextChangeDate) {
    meta.push(new Date(nextChangeDate + "T12:00:00").toLocaleDateString("pt-BR"));
  }

  if (nextChangeKm && nextChangeKm > 0) {
    meta.push(`${nextChangeKm.toLocaleString()} km`);
  }

  return [vehicleLabel, meta.join(" • ")].filter(Boolean).join(" • ");
}

export const notificationService = {
  async listStored() {
    const user = await authService.getUser();
    if (!user) {
      return {
        userId: null,
        notifications: [] as AppNotification[],
      };
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, body, created_at, is_read, maintenance_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const rows = (data ?? []) as StoredNotificationRow[];

    return {
      userId: user.id,
      notifications: rows.map<AppNotification>((row) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        createdAt: row.created_at,
        isRead: row.is_read,
        href: row.maintenance_id ? `/maintenances/${row.maintenance_id}` : "/fuel/new?source=location-reminder",
        kind: "fuel_reminder",
        source: "stored",
      })),
    };
  },

  async markStoredAsRead(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) throw error;
  },

  getDerivedReadIds(userId: string) {
    if (typeof window === "undefined") {
      return [] as string[];
    }

    const raw = window.localStorage.getItem(`${DERIVED_READ_STORAGE_KEY}:${userId}`);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
    } catch {
      return [];
    }
  },

  saveDerivedReadIds(userId: string, ids: string[]) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(`${DERIVED_READ_STORAGE_KEY}:${userId}`, JSON.stringify(ids));
  },

  buildDerivedNotifications(data: DashboardData, readIds: string[]) {
    const readSet = new Set(readIds);

    const highPriority = data.pendingHighPriority.map<AppNotification>((item) => ({
      id: buildDerivedNotificationId("maintenance-high", item.id),
      title: item.title,
      body: formatMaintenanceSubtitle(`${item.vehicles?.brand} ${item.vehicles?.model}`, item.next_change_date, item.next_change_km) || "Alta prioridade pendente",
      createdAt: item.created_at,
      isRead: readSet.has(buildDerivedNotificationId("maintenance-high", item.id)),
      href: `/maintenances/${item.id}`,
      kind: "maintenance_high",
      source: "derived",
    }));

    const overdue = data.overdueAlerts.map<AppNotification>((item) => ({
      id: buildDerivedNotificationId("maintenance-overdue", item.id),
      title: item.title,
      body: formatMaintenanceSubtitle(`${item.vehicles?.brand} ${item.vehicles?.model}`, item.next_change_date, item.next_change_km) || "Manutenção vencida",
      createdAt: item.created_at,
      isRead: readSet.has(buildDerivedNotificationId("maintenance-overdue", item.id)),
      href: `/maintenances/${item.id}`,
      kind: "maintenance_overdue",
      source: "derived",
    }));

    const upcoming = data.upcomingAlerts.map<AppNotification>((item) => ({
      id: buildDerivedNotificationId("maintenance-upcoming", item.id),
      title: item.title,
      body: formatMaintenanceSubtitle(`${item.vehicles?.brand} ${item.vehicles?.model}`, item.next_change_date, item.next_change_km) || "Manutenção próxima",
      createdAt: item.created_at,
      isRead: readSet.has(buildDerivedNotificationId("maintenance-upcoming", item.id)),
      href: `/maintenances/${item.id}`,
      kind: "maintenance_upcoming",
      source: "derived",
    }));

    return [...highPriority, ...overdue, ...upcoming].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },
};
