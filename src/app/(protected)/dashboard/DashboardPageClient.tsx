"use client";

import { AlertTriangle, ArrowRight, CarFront, CircleGauge, Clock3, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/features/dashboard/viewmodel/useDashboard";
import { useFuelStats } from "@/features/fuel/viewmodel/useFuel";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatMaintenanceMeta(date?: string | null, km?: number | null) {
  const parts: string[] = [];

  if (date) {
    parts.push(new Date(date + "T12:00:00").toLocaleDateString("pt-BR"));
  }

  if (km && km > 0) {
    parts.push(`${km.toLocaleString()} km`);
  }

  return parts.join(" • ");
}

export default function DashboardPageClient() {
  const router = useRouter();
  const { data, isLoading } = useDashboard();
  const { data: fuelStats } = useFuelStats();

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Visão geral dos seus veículos</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      label: "Veículos",
      value: data.totalVehicles.toString(),
      icon: CarFront,
      tone: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    },
    {
      label: "Pendentes",
      value: data.pendingCount.toString(),
      icon: Wrench,
      tone: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    },
    {
      label: "Média km/l",
      value: fuelStats?.avg_km_per_liter != null ? `${fuelStats.avg_km_per_liter.toFixed(1)}` : "—",
      icon: CircleGauge,
      tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    },
    {
      label: "Abastecimentos",
      value: fuelStats?.log_count?.toString() ?? "0",
      icon: Clock3,
      tone: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    },
  ];

  const secondaryStats = [
    { label: "Gastos do ano", value: formatCurrency(data.yearlySpending) },
    { label: "Gasto combustível", value: fuelStats ? formatCurrency(fuelStats.total_spent) : "—" },
    { label: "Alertas ativos", value: data.alertCount.toString() },
    { label: "Próximas trocas", value: data.upcomingChanges.length.toString() },
  ];

  const attentionItems = [
    ...data.pendingHighPriority.slice(0, 1).map((item) => ({
      id: `high-${item.id}`,
      title: item.title,
      subtitle: `${item.vehicles?.brand} ${item.vehicles?.model} • Alta prioridade`,
      href: `/maintenances/${item.id}`,
      tone: "border-amber-300 bg-amber-100/80 text-amber-950 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-100",
      badge: "Alta",
    })),
    ...data.overdueAlerts.slice(0, 2).map((item) => ({
      id: `overdue-${item.id}`,
      title: item.title,
      subtitle: `${item.vehicles?.brand} ${item.vehicles?.model} • ${formatMaintenanceMeta(item.next_change_date, item.next_change_km)}`,
      href: `/maintenances/${item.id}`,
      tone: "border-amber-300 bg-amber-100/80 text-amber-950 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-100",
      badge: "Vencido",
    })),
    ...data.upcomingAlerts.slice(0, 1).map((item) => ({
      id: `upcoming-${item.id}`,
      title: item.title,
      subtitle: `${item.vehicles?.brand} ${item.vehicles?.model} • ${formatMaintenanceMeta(item.next_change_date, item.next_change_km)}`,
      href: `/maintenances/${item.id}`,
      tone: "border-amber-300 bg-amber-100/80 text-amber-950 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-100",
      badge: "Em breve",
    })),
  ].slice(0, 3);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Visão geral dos seus veículos</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-950/10 dark:shadow-none">
          <CardBody className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-blue-100">Gastos do mês</p>
                <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{formatCurrency(data.monthlySpending)}</p>
                <p className="mt-2 text-sm text-blue-100/90">{data.totalMaintenances} manutenção{data.totalMaintenances !== 1 ? "s" : ""} registrada{data.totalMaintenances !== 1 ? "s" : ""}</p>
              </div>
              <div className="rounded-2xl bg-white/12 p-3 backdrop-blur-sm">
                <CircleGauge className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div key={card.label} className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-blue-50">
                      <Icon className="h-4 w-4" />
                      <p className="text-xs font-medium">{card.label}</p>
                    </div>
                    <p className="mt-2 text-xl font-bold text-white">{card.value}</p>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <div className="-mx-4 overflow-x-auto px-4 lg:hidden">
          <div className="flex gap-3 pb-1">
            {secondaryStats.map((card) => (
              <Card key={card.label} className="min-w-[170px] shrink-0">
                <CardBody className="p-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-amber-200 bg-amber-50/70 lg:hidden dark:border-amber-800 dark:bg-amber-900/20">
          <CardHeader className="flex items-start justify-between gap-3 border-amber-200 dark:border-amber-800">
            <div className="flex min-w-0 items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              <h2 className="text-base font-semibold text-amber-900 dark:text-amber-100">Atenção agora</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/maintenances")}>Ver todos</Button>
          </CardHeader>
          <CardBody>
            {attentionItems.length === 0 ? (
              <p className="text-sm text-amber-800/80 dark:text-amber-200/80">Nenhum alerta no momento.</p>
            ) : (
              <div className="space-y-3">
                {attentionItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push(item.href)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors hover:opacity-90 ${item.tone}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.title}</p>
                        <p className="mt-1 text-xs opacity-75">{item.subtitle}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                        {item.badge}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <div className="hidden gap-4 lg:grid">
          <div className="grid gap-4 sm:grid-cols-2">
            {secondaryStats.map((card) => (
              <Card key={card.label}>
                <CardBody className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reparos Pendentes</h2>
            {data.pendingRepairs.length > 0 && (
              <Button variant="ghost" size="sm" className="self-start sm:self-auto" onClick={() => router.push("/maintenances")}>
                Ver todos
              </Button>
            )}
          </CardHeader>
          <CardBody>
            {data.pendingRepairs.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum reparo pendente.</p>
            ) : (
              <div className="space-y-2">
                {data.pendingRepairs.slice(0, 4).map((m) => (
                  <div
                    key={`pending-${m.id}`}
                    onClick={() => router.push(`/maintenances/${m.id}`)}
                    className={`flex min-w-0 cursor-pointer flex-col items-start gap-2 rounded-lg p-2.5 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-gray-700/50 ${
                      m.priority === "high"
                        ? "border border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10"
                        : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white sm:truncate">{m.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {m.vehicles?.brand} {m.vehicles?.model}
                      </p>
                    </div>
                    <span className={`self-end rounded px-1.5 py-0.5 text-[10px] font-bold sm:ml-2 sm:self-auto ${
                      m.priority === "high"
                        ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300"
                        : m.priority === "medium"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
                    }`}>
                      {m.priority === "high" ? "Alta" : m.priority === "medium" ? "Média" : "Baixa"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="hidden lg:block">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alertas</h2>
          </CardHeader>
          <CardBody>
            {data.overdueAlerts.length === 0 && data.upcomingAlerts.length === 0 && data.pendingHighPriority.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum alerta no momento.</p>
            ) : (
              <div className="space-y-3">
                {data.pendingHighPriority.map((alert) => (
                  <div
                    key={`high-${alert.id}`}
                    onClick={() => router.push(`/maintenances/${alert.id}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <span className="shrink-0 rounded bg-red-200 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-800 dark:text-red-300">
                      ALTA PRIORIDADE
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-red-800 dark:text-red-300">{alert.title}</p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {alert.vehicles?.brand} {alert.vehicles?.model} — Pendente
                      </p>
                    </div>
                  </div>
                ))}
                {data.overdueAlerts.map((alert) => (
                  <div
                    key={`overdue-${alert.id}`}
                    onClick={() => router.push(`/maintenances/${alert.id}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <span className="shrink-0 rounded bg-red-200 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-800 dark:text-red-300">
                      VENCIDO
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-red-800 dark:text-red-300">{alert.title}</p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {alert.vehicles?.brand} {alert.vehicles?.model}
                        {alert.next_change_date && ` — ${new Date(alert.next_change_date + "T12:00:00").toLocaleDateString("pt-BR")}`}
                        {alert.next_change_km && alert.next_change_km > 0 && ` — ${alert.next_change_km.toLocaleString()} km`}
                      </p>
                    </div>
                  </div>
                ))}
                {data.upcomingAlerts.map((alert) => (
                  <div
                    key={`upcoming-${alert.id}`}
                    onClick={() => router.push(`/maintenances/${alert.id}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  >
                    <span className="shrink-0 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-800 dark:text-amber-300">
                      EM BREVE
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-amber-800 dark:text-amber-300">{alert.title}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        {alert.vehicles?.brand} {alert.vehicles?.model}
                        {alert.next_change_date && ` — ${new Date(alert.next_change_date + "T12:00:00").toLocaleDateString("pt-BR")}`}
                        {alert.next_change_km && alert.next_change_km > 0 && ` — ${alert.next_change_km.toLocaleString()} km`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Próximas trocas</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/maintenances")}>
              Ver todas
            </Button>
          </CardHeader>
          <CardBody>
            {data.upcomingChanges.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma troca programada.</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingChanges.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    onClick={() => router.push(`/maintenances/${m.id}`)}
                    className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{m.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {m.vehicles?.brand} {m.vehicles?.model}
                      </p>
                    </div>
                    <div className="ml-2 shrink-0 text-right">
                      {m.next_change_date && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(m.next_change_date + "T12:00:00").toLocaleDateString("pt-BR")}
                        </p>
                      )}
                      {m.next_change_km && m.next_change_km > 0 && (
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {m.next_change_km.toLocaleString()} km
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Últimas manutenções</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/maintenances")}>
              Ver todas
            </Button>
          </CardHeader>
          <CardBody>
            {data.recentMaintenances.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma manutenção registrada.</p>
            ) : (
              <div className="space-y-1">
                {data.recentMaintenances.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    onClick={() => router.push(`/maintenances/${m.id}`)}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{m.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {m.vehicles?.brand} {m.vehicles?.model} — {new Date(m.maintenance_date + "T12:00:00").toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2 text-gray-400">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(m.amount)}</p>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
