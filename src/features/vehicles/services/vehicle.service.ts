import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import { billingService } from "@/features/billing/services/billing.service";
import type { VehicleFormData } from "../model/schemas";

type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];

async function getCurrentUserId() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return user.id;
}

export const vehicleService = {
  async list(): Promise<VehicleRow[]> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<VehicleRow> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  async create(data: VehicleFormData): Promise<VehicleRow> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    await billingService.assertCanCreateVehicle();

    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== ""),
    );

    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .insert({ ...payload, user_id: userId } as never)
      .select()
      .single();

    if (error) throw error;
    return vehicle;
  },

  async update(id: string, data: Partial<VehicleFormData>): Promise<VehicleRow> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== ""),
    );

    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .update(payload as never)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return vehicle;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  },
};
