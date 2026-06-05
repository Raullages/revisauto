"use client";

import { useRouter } from "next/navigation";
import { useDashboard } from "@/features/dashboard/viewmodel/useDashboard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Visao geral dos seus veiculos</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Veiculos", value: data.totalVehicles.toString() },
    { label: "Gastos do mes", value: formatCurrency(data.monthlySpending) },
    { label: "Gastos do ano", value: formatCurrency(data.yearlySpending) },
    { label: "Manutencoes", value: data.totalMaintenances.toString() },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Visao geral dos seus veiculos</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alertas</h2>
          </CardHeader>
          <CardBody>
            {data.overdueAlerts.length === 0 && data.upcomingAlerts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum alerta no momento.</p>
            ) : (
              <div className="space-y-3">
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
                      <p className="text-sm font-medium text-red-800 dark:text-red-300 truncate">
                        {alert.title}
                      </p>
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
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300 truncate">
                        {alert.title}
                      </p>
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

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Proximas trocas</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/maintenances")}>
              Ver todas
            </Button>
          </CardHeader>
          <CardBody>
            {data.upcomingChanges.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma troca programada.</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingChanges.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => router.push(`/maintenances/${m.id}`)}
                    className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {m.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {m.vehicles?.brand} {m.vehicles?.model}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
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
      </div>

      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ultimas manutencoes</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push("/maintenances")}>
            Ver todas
          </Button>
        </CardHeader>
        <CardBody>
          {data.recentMaintenances.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma manutencao registrada.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.recentMaintenances.map((m) => (
                <div
                  key={m.id}
                  onClick={() => router.push(`/maintenances/${m.id}`)}
                  className="flex cursor-pointer items-center justify-between py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-2 px-2 rounded"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {m.vehicles?.brand} {m.vehicles?.model} — {new Date(m.maintenance_date + "T12:00:00").toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white shrink-0 ml-2">
                    {formatCurrency(m.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
