"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFuelLogs } from "@/features/fuel/viewmodel/useFuel";
import { useVehicles } from "@/features/vehicles/viewmodel/useVehicles";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import type { FuelLogWithVehicle } from "@/features/fuel/model/types";

const fuelTypeLabels: Record<string, string> = {
  gasolina: "Gasolina",
  etanol: "Etanol",
  diesel: "Diesel",
  gnv: "GNV",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getPricePerLiter(totalCost: number, liters: number, pricePerLiter: number | null) {
  return pricePerLiter ?? (totalCost / liters);
}

function getMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getMonthKeyFromDateString(date: string) {
  return date.slice(0, 7);
}

function formatMonthYear(date: Date) {
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  return `${month.charAt(0).toUpperCase()}${month.slice(1)}/${date.getFullYear()}`;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getFuelStats(logs: FuelLogWithVehicle[]) {
  if (logs.length === 0) {
    return {
      total_spent: 0,
      total_liters: 0,
      avg_km_per_liter: null as number | null,
      lastKmPerLiter: null as number | null,
    };
  }

  const total_spent = logs.reduce((sum, log) => sum + Number(log.total_cost), 0);
  const total_liters = logs.reduce((sum, log) => sum + Number(log.liters), 0);
  const fullTanksAsc = logs
    .filter((log) => log.is_full_tank)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let avg_km_per_liter: number | null = null;
  if (fullTanksAsc.length >= 2) {
    const totalKm = fullTanksAsc
      .slice(1)
      .reduce((sum, log, index) => sum + (log.odometer_km - fullTanksAsc[index].odometer_km), 0);
    const totalLitersFromSecond = fullTanksAsc.slice(1).reduce((sum, log) => sum + Number(log.liters), 0);

    if (totalLitersFromSecond > 0) {
      avg_km_per_liter = Math.round((totalKm / totalLitersFromSecond) * 100) / 100;
    }
  }

  let lastKmPerLiter: number | null = null;
  const fullTanksDesc = [...fullTanksAsc].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (fullTanksDesc.length >= 2) {
    const diff = fullTanksDesc[0].odometer_km - fullTanksDesc[1].odometer_km;
    if (diff > 0) {
      lastKmPerLiter = Math.round((diff / fullTanksDesc[0].liters) * 100) / 100;
    }
  }

  return {
    total_spent: Math.round(total_spent * 100) / 100,
    total_liters: Math.round(total_liters * 100) / 100,
    avg_km_per_liter,
    lastKmPerLiter,
  };
}

export default function FuelPage() {
  const router = useRouter();
  const { data: fuelLogs, isLoading } = useFuelLogs();
  const { data: vehicles } = useVehicles();
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState<"all" | "month">("month");
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

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

  const selectedMonthKey = getMonthKey(selectedMonth);
  const currentMonthKey = getMonthKey(new Date());
  const filteredByVehicle = (fuelLogs || []).filter(
    (f) => !vehicleFilter || f.vehicle_id === vehicleFilter,
  );
  const filtered = filteredByVehicle.filter(
    (f) => periodFilter === "all" || getMonthKeyFromDateString(f.date) === selectedMonthKey,
  );
  const stats = getFuelStats(filtered);
  const isCurrentMonth = selectedMonthKey === currentMonthKey;

  return (
    <div>
      <div className="mb-4 space-y-3">
        <div className="flex w-full items-center gap-2">
          <button
            type="button"
            onClick={() => setPeriodFilter("all")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              periodFilter === "all"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Todos
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900">
            <Button
              variant="ghost"
              size="sm"
              className="px-2"
              disabled={periodFilter === "all"}
              onClick={() => setSelectedMonth((current) => addMonths(current, -1))}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <button
              type="button"
              onClick={() => setPeriodFilter("month")}
              className={`flex-1 rounded-md px-2 py-1 text-center text-sm font-medium transition-colors ${
                periodFilter === "month"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {formatMonthYear(selectedMonth)}
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="px-2"
              disabled={periodFilter === "all" || isCurrentMonth}
              onClick={() => setSelectedMonth((current) => addMonths(current, 1))}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 sm:flex sm:items-center sm:justify-between sm:space-y-0">
          <div className="sm:flex sm:items-center sm:gap-3">
            {vehicles.length > 0 && (
              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white md:text-sm sm:w-auto"
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

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filtered.length} abastecimento{filtered.length !== 1 ? "s" : ""}
            </p>

            <Button onClick={() => router.push("/fuel/new")}>
              Novo abastecimento
            </Button>
          </div>
        </div>
      </div>

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
              {stats.lastKmPerLiter != null ? `${stats.lastKmPerLiter.toFixed(1)}` : "—"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Última km/l</p>
          </CardBody>
        </Card>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum abastecimento"
          description={
            vehicleFilter
              ? `Nenhum abastecimento para este veículo ${periodFilter === "all" ? "no histórico." : "neste mês."}`
              : periodFilter === "all"
                ? "Nenhum abastecimento registrado no histórico."
                : "Nenhum abastecimento registrado neste mês."
          }
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
                      {formatCurrency(getPricePerLiter(f.total_cost, f.liters, f.price_per_liter))}/L
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
