export type MaintenanceStatus = "pending" | "scheduled" | "completed";
export type MaintenancePriority = "low" | "medium" | "high";

export interface Maintenance {
  id: string;
  vehicle_id: string;
  category_id: string;
  title: string;
  description: string | null;
  maintenance_date: string | null;
  vehicle_km: number;
  amount: number;
  workshop: string | null;
  notes: string | null;
  next_change_km: number | null;
  next_change_date: string | null;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  created_at: string;
}

export interface MaintenanceWithRelations extends Maintenance {
  vehicles: { brand: string; model: string } | null;
  maintenance_categories: { name: string } | null;
}
