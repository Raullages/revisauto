"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMaintenances } from "@/features/maintenances/viewmodel/useMaintenances";
import { useVehicles } from "@/features/vehicles/viewmodel/useVehicles";
import type { MaintenanceStatus, MaintenancePriority } from "@/features/maintenances/model/types";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";

function isOverdue(maintenance: { next_change_km?: number | null; next_change_date?: string | null; vehicle_km: number }) {
  const today = new Date().toISOString().split("T")[0];
  const kmOverdue = maintenance.next_change_km && maintenance.next_change_km > 0 && maintenance.next_change_km <= maintenance.vehicle_km;
  const dateOverdue = maintenance.next_change_date && maintenance.next_change_date <= today;
  return kmOverdue || dateOverdue;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const statusTabs: { value: MaintenanceStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "scheduled", label: "Agendados" },
  { value: "completed", label: "Concluidos" },
];

const priorityLabels: Record<MaintenancePriority, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
};

const priorityColors: Record<MaintenancePriority, string> = {
  low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const statusColors: Record<MaintenanceStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  scheduled: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const statusLabels: Record<MaintenanceStatus, string> = {
  pending: "Pendente",
  scheduled: "Agendado",
  completed: "Concluido",
};

export default function MaintenancesPage() {
  const router = useRouter();
  const { data: maintenances, isLoading } = useMaintenances();
  const { data: vehicles } = useVehicles();
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | "all">("all");

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manutencoes</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Historico de servicos realizados</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const hasVehicles = vehicles && vehicles.length > 0;

  if (!hasVehicles) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manutencoes</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Historico de servicos realizados</p>
          </div>
        </div>
        <EmptyState
          title="Cadastre um veiculo primeiro"
          description="Voce precisa ter pelo menos um veiculo para registrar manutencoes"
          icon={
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          action={
            <Button onClick={() => router.push("/vehicles/new")}>
              Cadastrar veiculo
            </Button>
          }
        />
      </div>
    );
  }

  const filtered = (maintenances || [])
    .filter((m) => !vehicleFilter || m.vehicle_id === vehicleFilter)
    .filter((m) => statusFilter === "all" || m.status === statusFilter);

  const pendingCount = maintenances?.filter((m) => m.status === "pending").length || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manutencoes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} servico{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => router.push("/maintenances/new")}>
          Nova manutencao
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
              {tab.value === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {vehicles.length > 0 && (
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:w-auto"
          >
            <option value="">Todos os veiculos</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model}
              </option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma manutencao encontrada"
          description={statusFilter !== "all" ? `Nenhum item com status "${statusLabels[statusFilter]}".` : "Registre a primeira manutencao"}
          action={
            <Button onClick={() => router.push("/maintenances/new")}>
              Nova manutencao
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <Card
              key={m.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/maintenances/${m.id}`)}
            >
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${statusColors[m.status]}`}>
                        {statusLabels[m.status]}
                      </span>
                      {m.status === "pending" && (
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${priorityColors[m.priority]}`}>
                          {priorityLabels[m.priority]}
                        </span>
                      )}
                      {m.status !== "pending" && isOverdue({ ...m, vehicle_km: m.vehicle_km }) && (
                        <span className="inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          VENCIDO
                        </span>
                      )}
                      {m.maintenance_categories?.name && (
                        <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {m.maintenance_categories.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {m.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {m.vehicles?.brand} {m.vehicles?.model}
                      {m.maintenance_date && ` — ${new Date(m.maintenance_date + "T12:00:00").toLocaleDateString("pt-BR")}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(m.amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {m.vehicle_km.toLocaleString()} km
                    </p>
                  </div>
                </div>
                {m.workshop && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Oficina: {m.workshop}
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
