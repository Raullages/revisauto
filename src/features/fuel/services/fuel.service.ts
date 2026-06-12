import { createClient } from "@/lib/supabase/client";
import type { FuelLogWithVehicle, FuelStats } from "../model/types";
import type { FuelFormData } from "../model/schemas";

async function getCurrentUserId() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return user.id;
}

async function assertVehicleOwnership(vehicleId: string, userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", vehicleId)
    .eq("user_id", userId)
    .single();

  if (error || !data) throw new Error("Veículo não encontrado");
}

export const fuelService = {
  async list(vehicleId?: string): Promise<FuelLogWithVehicle[]> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    let query = supabase
      .from("fuel_logs")
      .select("*, vehicles!inner(brand, model, plate)")
      .eq("vehicles.user_id", userId)
      .order("date", { ascending: false });

    if (vehicleId) {
      query = query.eq("vehicle_id", vehicleId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data as FuelLogWithVehicle[]) || [];
  },

  async listByVehicle(vehicleId: string): Promise<FuelLogWithVehicle[]> {
    return fuelService.list(vehicleId);
  },

  async getById(id: string): Promise<FuelLogWithVehicle> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("fuel_logs")
      .select("*, vehicles!inner(brand, model, plate, user_id)")
      .eq("id", id)
      .eq("vehicles.user_id", userId)
      .single();

    if (error) throw error;
    return data as FuelLogWithVehicle;
  },

  async create(data: FuelFormData): Promise<FuelLogWithVehicle> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    await assertVehicleOwnership(data.vehicle_id, userId);

    const payload: Record<string, unknown> = {
      ...Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== ""),
      ),
      price_per_liter: Math.round((data.total_cost / data.liters) * 1000) / 1000,
    };

    const { data: fuelLog, error } = await supabase
      .from("fuel_logs")
      .insert(payload as never)
      .select("*, vehicles(brand, model, plate)")
      .single();

    if (error) throw error;
    return fuelLog as FuelLogWithVehicle;
  },

  async update(id: string, data: Partial<FuelFormData>): Promise<FuelLogWithVehicle> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    await fuelService.getById(id);

    if (data.vehicle_id) {
      await assertVehicleOwnership(data.vehicle_id, userId);
    }

    const filtered = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== ""),
    ) as Record<string, unknown>;

    if (filtered.total_cost && filtered.liters) {
      filtered.price_per_liter =
        Math.round(((filtered.total_cost as number) / (filtered.liters as number)) * 1000) / 1000;
    }

    const { data: fuelLog, error } = await supabase
      .from("fuel_logs")
      .update(filtered as never)
      .eq("id", id)
      .select("*, vehicles(brand, model, plate)")
      .single();

    if (error) throw error;
    return fuelLog as FuelLogWithVehicle;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();

    await fuelService.getById(id);

    const { error } = await supabase
      .from("fuel_logs")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getStats(vehicleId?: string): Promise<FuelStats> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    type StatsRow = {
      odometer_km: number;
      liters: number;
      total_cost: number;
      is_full_tank: boolean;
      vehicle_id: string;
    };

    let query = supabase
      .from("fuel_logs")
      .select("odometer_km, liters, total_cost, is_full_tank, vehicle_id, vehicles!inner(user_id)")
      .eq("vehicles.user_id", userId)
      .order("date", { ascending: true });

    if (vehicleId) {
      query = query.eq("vehicle_id", vehicleId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const rows = (data as unknown as StatsRow[]) || [];

    if (rows.length === 0) {
      return { total_spent: 0, total_liters: 0, avg_km_per_liter: null, last_odometer: null, log_count: 0 };
    }

    const total_spent = rows.reduce((sum, d) => sum + Number(d.total_cost), 0);
    const total_liters = rows.reduce((sum, d) => sum + Number(d.liters), 0);

    let avg_km_per_liter: number | null = null;

    const fullTanks = rows.filter((d) => d.is_full_tank);
    if (fullTanks.length >= 2) {
      const diffs: number[] = [];
      for (let i = 1; i < fullTanks.length; i++) {
        diffs.push(fullTanks[i].odometer_km - fullTanks[i - 1].odometer_km);
      }
      const totalKm = diffs.reduce((sum, d) => sum + d, 0);
      const totalLitersFromSecond = fullTanks.slice(1).reduce((sum, d) => sum + Number(d.liters), 0);
      if (totalLitersFromSecond > 0) {
        avg_km_per_liter = Math.round((totalKm / totalLitersFromSecond) * 100) / 100;
      }
    }

    return {
      total_spent: Math.round(total_spent * 100) / 100,
      total_liters: Math.round(total_liters * 100) / 100,
      avg_km_per_liter,
      last_odometer: rows[rows.length - 1].odometer_km,
      log_count: rows.length,
    };
  },
};
