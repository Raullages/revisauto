import { createClient } from "@/lib/supabase/client";
import type { MaintenanceWithRelations } from "../model/types";
import type { MaintenanceFormData } from "../model/schemas";

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

export const maintenanceService = {
  async list(): Promise<MaintenanceWithRelations[]> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("maintenances")
      .select("*, vehicles!inner(brand, model), maintenance_categories(name)")
      .eq("vehicles.user_id", userId)
      .order("maintenance_date", { ascending: false });

    if (error) throw error;
    return (data as MaintenanceWithRelations[]) || [];
  },

  async listByVehicle(vehicleId: string): Promise<MaintenanceWithRelations[]> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("maintenances")
      .select("*, vehicles!inner(brand, model), maintenance_categories(name)")
      .eq("vehicle_id", vehicleId)
      .eq("vehicles.user_id", userId)
      .order("maintenance_date", { ascending: false });

    if (error) throw error;
    return (data as MaintenanceWithRelations[]) || [];
  },

  async getById(id: string): Promise<MaintenanceWithRelations> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("maintenances")
      .select("*, vehicles!inner(brand, model, user_id), maintenance_categories(name)")
      .eq("id", id)
      .eq("vehicles.user_id", userId)
      .single();

    if (error) throw error;
    return data as MaintenanceWithRelations;
  },

  async create(data: MaintenanceFormData): Promise<MaintenanceWithRelations> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    await assertVehicleOwnership(data.vehicle_id, userId);

    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== ""),
    );

    if (data.status === "pending" && !data.maintenance_date) {
      payload.maintenance_date = null;
    }

    const { data: maintenance, error } = await supabase
      .from("maintenances")
      .insert(payload as never)
      .select("*, vehicles(brand, model), maintenance_categories(name)")
      .single();

    if (error) throw error;
    return maintenance as MaintenanceWithRelations;
  },

  async update(id: string, data: Partial<MaintenanceFormData>): Promise<MaintenanceWithRelations> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    await maintenanceService.getById(id);

    if (data.vehicle_id) {
      await assertVehicleOwnership(data.vehicle_id, userId);
    }

    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== ""),
    );

    if (data.status === "pending" && data.maintenance_date === "") {
      payload.maintenance_date = null;
    }

    const { data: maintenance, error } = await supabase
      .from("maintenances")
      .update(payload as never)
      .eq("id", id)
      .select("*, vehicles(brand, model), maintenance_categories(name)")
      .single();

    if (error) throw error;
    return maintenance as MaintenanceWithRelations;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();

    await maintenanceService.getById(id);

    const { error } = await supabase
      .from("maintenances")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
