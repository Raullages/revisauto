"use client";

import { PremiumFeatureGate } from "@/components/billing/PremiumFeatureGate";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { isPremiumTier } from "@/features/billing/model/plans";
import { useCurrentPlan } from "@/features/billing/viewmodel/useBilling";

export default function FuelCalculatorPage() {
  const { data: plan, isLoading } = useCurrentPlan();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isPremiumTier(plan?.subscription_tier)) {
    return (
      <PremiumFeatureGate
        title="Calculadora de combustível faz parte do Premium"
        description="Compare cenários de consumo e custo por quilômetro no plano Premium."
      />
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Calculadora de combustível
      </h2>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">
          Em breve — compare gasolina vs etanol, calcule custo por km, autonomia e mais.
        </p>
      </div>
    </div>
  );
}
