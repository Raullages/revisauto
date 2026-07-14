"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FREE_PLAN_LIMITS, isPremiumTier } from "@/features/billing/model/plans";
import { useCurrentPlan } from "@/features/billing/viewmodel/useBilling";

const comparisonRows = [
  {
    label: "Veículos",
    free: `Até ${FREE_PLAN_LIMITS.vehicles}`,
    premium: "Ilimitados",
  },
  {
    label: "Manutenções",
    free: `Até ${FREE_PLAN_LIMITS.maintenances}`,
    premium: "Ilimitadas",
  },
  {
    label: "Abastecimentos",
    free: `Até ${FREE_PLAN_LIMITS.fuelLogs}`,
    premium: "Ilimitados",
  },
  {
    label: "Dashboard",
    free: "Versão simples",
    premium: "Versão completa",
  },
  {
    label: "Postos próximos",
    free: "Não incluso",
    premium: "Incluso",
  },
  {
    label: "Calculadora",
    free: "Não incluso",
    premium: "Incluso",
  },
  {
    label: "Relatórios",
    free: "Não incluso",
    premium: "Incluso",
  },
] as const;

export default function PremiumPage() {
  const searchParams = useSearchParams();
  const { data: plan } = useCurrentPlan();
  const premiumActive = isPremiumTier(plan?.subscription_tier);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    const checkoutState = searchParams.get("checkout");

    if (checkoutState === "success") {
      toast.success("Pagamento concluído. Assim que o Stripe confirmar a assinatura, seu Premium será liberado.");
    }

    if (checkoutState === "cancelled") {
      toast("Checkout cancelado.", { icon: "" });
    }
  }, [searchParams]);

  const handleUpgradeClick = () => {
    if (premiumActive) {
      toast("Seu plano Premium já está ativo.", { icon: "" });
      return;
    }

    setLoadingCheckout(true);

    void (async () => {
      try {
        const response = await fetch("/api/billing/checkout", {
          method: "POST",
        });

        const payload = (await response.json()) as { url?: string; error?: string };

        if (!response.ok || !payload.url) {
          throw new Error(payload.error || "Erro ao iniciar checkout");
        }

        window.location.href = payload.url;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao iniciar checkout");
        setLoadingCheckout(false);
      }
    })();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/profile"
        className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </Link>

      <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_360px]">
        <div>
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-blue-950/10">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-50">
              Plano Premium
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">Mais controle do carro. Menos limite no app.</h1>
            <p className="mt-3 max-w-2xl text-sm text-blue-50/90 sm:text-base">
              Desbloqueie o revisAuto completo para acompanhar mais veículos, manter histórico sem travas e usar recursos avançados no módulo de combustível.
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-4">
              <div>
                <p className="text-sm text-blue-100">Preço</p>
                <p className="text-4xl font-bold">R$ 12,90<span className="text-lg font-medium text-blue-100">/mês</span></p>
              </div>
              <p className="text-sm text-blue-100">Cancelamento a qualquer momento</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleUpgradeClick} loading={loadingCheckout} className="bg-white text-blue-700 hover:bg-blue-50">
                {premiumActive ? "Premium já ativo" : "Quero fazer upgrade"}
              </Button>
              <Link href="/profile">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 dark:border-white/30 dark:text-white dark:hover:bg-white/10">
                  Ver meu plano atual
                </Button>
              </Link>
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comparativo</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Recurso</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Free</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.label} className="border-b border-gray-100 last:border-0 dark:border-gray-700">
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{row.label}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{row.free}</td>
                        <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">{row.premium}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">O que você libera</h2>
            </CardHeader>
            <CardBody className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p>Veículos ilimitados para quem cuida de mais de um carro.</p>
              <p>Histórico completo de manutenções e abastecimentos sem perder referência antiga.</p>
              <p>Dashboard mais rico com gastos, médias e visão operacional melhor.</p>
              <p>Postos próximos, calculadora e relatórios dentro do módulo de combustível.</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Status atual</h2>
            </CardHeader>
            <CardBody>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                <p className="text-sm text-gray-500 dark:text-gray-400">Seu plano</p>
                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{premiumActive ? "Premium" : "Free"}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {premiumActive
                    ? "Você já tem acesso aos recursos premium."
                    : "Você pode fazer upgrade quando quiser para remover limites e liberar recursos avançados."}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
