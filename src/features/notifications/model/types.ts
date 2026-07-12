export type AppNotificationKind = "fuel_reminder" | "maintenance_high" | "maintenance_overdue" | "maintenance_upcoming";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  href: string;
  kind: AppNotificationKind;
  source: "stored" | "derived";
}
