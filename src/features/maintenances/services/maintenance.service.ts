import { createClient } from "@/lib/supabase/client";
import type { MaintenanceWithRelations } from "../model/types";
import type { MaintenanceFormData } from "../model/schemas";

export const maintenanceService = {
  async list(): Promise<MaintenanceWithRelations[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nao autenticado");

    const { data, error } = await supabase
      .from("maintenances")
      .select("*, vehicles!inner(brand, model), maintenance_categories(name)")
      .eq("vehicles.user_id", user.id)
      .order("maintenance_date", { ascending: false });

    if (error) throw error;
    return (data as MaintenanceWithRelations[]) || [];
  },

  async listByVehicle(vehicleId: string): Promise<MaintenanceWithRelations[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("maintenances")
      .select("*, vehicles!inner(brand, model), maintenance_categories(name)")
      .eq("vehicle_id", vehicleId)
      .order("maintenance_date", { ascending: false });

    if (error) throw error;
    return (data as MaintenanceWithRelations[]) || [];
  },

  async getById(id: string): Promise<MaintenanceWithRelations> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("maintenances")
      .select("*, vehicles(brand, model), maintenance_categories(name)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as MaintenanceWithRelations;
  },

  async create(data: MaintenanceFormData): Promise<MaintenanceWithRelations> {
    const supabase = createClient();

    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== ""),
    );

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

    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== ""),
    );

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
    const { error } = await supabase
      .from("maintenances")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
