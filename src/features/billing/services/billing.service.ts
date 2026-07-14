import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import {
  FREE_PLAN_LIMITS,
  PREMIUM_FEATURE_LABELS,
  type PremiumFeature,
  type SubscriptionTier,
  isPremiumTier,
} from "../model/plans";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CurrentPlan = Pick<ProfileRow, "subscription_tier"> & {
  subscription_tier: SubscriptionTier;
};

export class BillingError extends Error {
  code: "free_limit_reached" | "premium_required";

  constructor(message: string, code: "free_limit_reached" | "premium_required") {
    super(message);
    this.name = "BillingError";
    this.code = code;
  }
}

async function getCurrentUserContext() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado");
  }

  return { supabase, userId: user.id };
}

async function getSubscriptionTierForUser(userId: string): Promise<SubscriptionTier> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return (data?.subscription_tier as SubscriptionTier | null) ?? "free";
}

export const billingService = {
  async getCurrentPlan(): Promise<CurrentPlan> {
    const { userId } = await getCurrentUserContext();
    const subscription_tier = await getSubscriptionTierForUser(userId);
    return { subscription_tier };
  },

  async assertCanCreateVehicle() {
    const { supabase, userId } = await getCurrentUserContext();
    const tier = await getSubscriptionTierForUser(userId);

    if (isPremiumTier(tier)) {
      return;
    }

    const { count, error } = await supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    if ((count ?? 0) >= FREE_PLAN_LIMITS.vehicles) {
      throw new BillingError(
        `O plano gratuito permite até ${FREE_PLAN_LIMITS.vehicles} veículo. Faça upgrade para cadastrar mais.`,
        "free_limit_reached",
      );
    }
  },

  async assertCanCreateMaintenance() {
    const { supabase, userId } = await getCurrentUserContext();
    const tier = await getSubscriptionTierForUser(userId);

    if (isPremiumTier(tier)) {
      return;
    }

    const { count, error } = await supabase
      .from("maintenances")
      .select("id, vehicles!inner(user_id)", { count: "exact", head: true })
      .eq("vehicles.user_id", userId);

    if (error) {
      throw error;
    }

    if ((count ?? 0) >= FREE_PLAN_LIMITS.maintenances) {
      throw new BillingError(
        `Você atingiu o limite de ${FREE_PLAN_LIMITS.maintenances} manutenções do plano gratuito.`,
        "free_limit_reached",
      );
    }
  },

  async assertCanCreateFuelLog() {
    const { supabase, userId } = await getCurrentUserContext();
    const tier = await getSubscriptionTierForUser(userId);

    if (isPremiumTier(tier)) {
      return;
    }

    const { count, error } = await supabase
      .from("fuel_logs")
      .select("id, vehicles!inner(user_id)", { count: "exact", head: true })
      .eq("vehicles.user_id", userId);

    if (error) {
      throw error;
    }

    if ((count ?? 0) >= FREE_PLAN_LIMITS.fuelLogs) {
      throw new BillingError(
        `Você atingiu o limite de ${FREE_PLAN_LIMITS.fuelLogs} abastecimentos do plano gratuito.`,
        "free_limit_reached",
      );
    }
  },

  async assertPremiumAccess(feature: PremiumFeature) {
    const { userId } = await getCurrentUserContext();
    const tier = await getSubscriptionTierForUser(userId);

    if (isPremiumTier(tier)) {
      return;
    }

    throw new BillingError(`${PREMIUM_FEATURE_LABELS[feature]} faz parte do plano Premium.`, "premium_required");
  },
};
