export interface Vehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  version: string | null;
  plate: string | null;
  color: string | null;
  fuel: string | null;
  current_km: number;
  chassis: string | null;
  renavam: string | null;
  acquisition_date: string | null;
  notes: string | null;
  created_at: string;
}

export type VehicleFormData = Omit<Vehicle, "id" | "user_id" | "created_at">;
