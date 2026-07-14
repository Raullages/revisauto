export const FREE_PLAN_LIMITS = {
  vehicles: 1,
  maintenances: 25,
  fuelLogs: 25,
} as const;

export type SubscriptionTier = "free" | "premium";

export type PremiumFeature = "nearbyStations" | "fuelCalculator" | "fuelReports";

export const PREMIUM_FEATURE_LABELS: Record<PremiumFeature, string> = {
  nearbyStations: "Postos proximos",
  fuelCalculator: "Calculadora de combustivel",
  fuelReports: "Relatorios",
};

export function isPremiumTier(tier: SubscriptionTier | null | undefined) {
  return tier === "premium";
}
