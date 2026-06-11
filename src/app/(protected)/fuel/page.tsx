"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFuelLogs, useFuelStats } from "@/features/fuel/viewmodel/useFuel";
import { useVehicles } from "@/features/vehicles/viewmodel/useVehicles";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";

const fuelTypeLabels: Record<string, string> = {
  gasolina: "Gasolina",
  etanol: "Etanol",
  diesel: "Diesel",
  gnv: "GNV",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FuelPage() {
  const router = useRouter();
  const { data: fuelLogs, isLoading } = useFuelLogs();
  const { data: vehicles } = useVehicles();
  const { data: stats } = useFuelStats();
  const [vehicleFilter, setVehicleFilter] = useState("");

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Carregando abastecimentos...</p>
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
      <EmptyState
        title="Cadastre um veículo primeiro"
        description="Você precisa ter pelo menos um veículo para registrar abastecimentos"
        icon={
          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        }
        action={
          <Button onClick={() => router.push("/vehicles/new")}>
            Cadastrar veículo
          </Button>
        }
      />
    );
  }

  const filtered = (fuelLogs || []).filter(
    (f) => !vehicleFilter || f.vehicle_id === vehicleFilter,
  );

  let lastKmPerLiter: number | null = null;
  const fullTanks = (fuelLogs || []).filter((f) => f.is_full_tank);
  if (fullTanks.length >= 2) {
    const sorted = [...fullTanks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const diff = sorted[0].odometer_km - sorted[1].odometer_km;
    if (diff > 0) {
      lastKmPerLiter = Math.round((diff / sorted[0].liters) * 100) / 100;
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} abastecimento{filtered.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={() => router.push("/fuel/new")}>
          Novo abastecimento
        </Button>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.total_spent)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total gasto</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total_liters.toLocaleString()} L
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total litros</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.avg_km_per_liter != null ? `${stats.avg_km_per_liter.toFixed(1)}` : "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Média km/l</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {lastKmPerLiter != null ? `${lastKmPerLiter.toFixed(1)}` : "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Última km/l</p>
            </CardBody>
          </Card>
        </div>
      )}

      <div className="mb-4">
        {vehicles.length > 0 && (
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base md:text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:w-auto"
          >
            <option value="">Todos os veículos</option>
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
          title="Nenhum abastecimento"
          description={vehicleFilter ? "Nenhum abastecimento para este veículo." : "Registre o primeiro abastecimento"}
          action={
            <Button onClick={() => router.push("/fuel/new")}>
              Novo abastecimento
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <Card
              key={f.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/fuel/${f.id}`)}
            >
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {fuelTypeLabels[f.fuel_type]}
                      </span>
                      {f.is_full_tank && (
                        <span className="inline-flex items-center rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Tanque cheio
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {f.vehicles?.brand} {f.vehicles?.model}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(f.date + "T12:00:00").toLocaleDateString("pt-BR")}
                      {f.gas_station && ` — ${f.gas_station}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(f.total_cost)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {f.liters} L — {f.odometer_km.toLocaleString()} km
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
