import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import type { VehicleFormData } from "../model/schemas";

type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];

export const vehicleService = {
  async list(): Promise<VehicleRow[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nao autenticado");

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<VehicleRow> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(data: VehicleFormData): Promise<VehicleRow> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nao autenticado");

    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== ""),
    );

    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .insert({ ...payload, user_id: user.id } as never)
      .select()
      .single();

    if (error) throw error;
    return vehicle;
  },

  async update(id: string, data: Partial<VehicleFormData>): Promise<VehicleRow> {
    const supabase = createClient();

    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== ""),
    );

    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .update(payload as never)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return vehicle;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
