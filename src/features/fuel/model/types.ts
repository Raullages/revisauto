export type FuelType = "gasolina" | "etanol" | "diesel" | "gnv";

export interface FuelLog {
  id: string;
  vehicle_id: string;
  date: string;
  odometer_km: number;
  liters: number;
  total_cost: number;
  price_per_liter: number | null;
  fuel_type: FuelType;
  is_full_tank: boolean;
  gas_station: string | null;
  notes: string | null;
  created_at: string;
}

export interface FuelLogWithVehicle extends FuelLog {
  vehicles: { brand: string; model: string; plate: string | null } | null;
}

export interface FuelStats {
  total_spent: number;
  total_liters: number;
  avg_km_per_liter: number | null;
  last_odometer: number | null;
  log_count: number;
}
