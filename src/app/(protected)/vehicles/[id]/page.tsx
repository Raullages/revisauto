"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useVehicle, useDeleteVehicle } from "@/features/vehicles/viewmodel/useVehicles";
import { useFuelLogsByVehicle } from "@/features/fuel/viewmodel/useFuel";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useState } from "react";

const fuelLabels: Record<string, string> = {
  Gasolina: "Gasolina",
  Etanol: "Etanol",
  Flex: "Flex",
  Diesel: "Diesel",
  GNV: "GNV",
  Elétrico: "Elétrico",
  Híbrido: "Híbrido",
};

const fuelTypeLabels: Record<string, string> = {
  gasolina: "Gasolina",
  etanol: "Etanol",
  diesel: "Diesel",
  gnv: "GNV",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: vehicle, isLoading } = useVehicle(id);
  const { mutateAsync: deleteVehicle, isPending: deleting } = useDeleteVehicle();
  const { data: fuelLogs } = useFuelLogsByVehicle(id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Veículo não encontrado</p>
        <Link href="/vehicles" className="mt-2 inline-block text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm">
          Voltar para lista
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteVehicle(vehicle.id);
      toast.success("Veículo removido");
      router.push("/vehicles");
    } catch {
      toast.error("Erro ao remover veículo");
    }
  };

  const infoRows = [
    { label: "Marca", value: vehicle.brand },
    { label: "Modelo", value: vehicle.model },
    { label: "Ano", value: vehicle.year },
    { label: "Versao", value: vehicle.version },
    { label: "Placa", value: vehicle.plate },
    { label: "Cor", value: vehicle.color },
    { label: "Combustivel", value: vehicle.fuel ? fuelLabels[vehicle.fuel] || vehicle.fuel : null },
    { label: "KM Atual", value: vehicle.current_km?.toLocaleString() },
    { label: "Chassi", value: vehicle.chassis },
    { label: "Renavam", value: vehicle.renavam },
    { label: "Data de Aquisicao", value: vehicle.acquisition_date },
    { label: "Observações", value: vehicle.notes },
  ].filter((row) => row.value != null && row.value !== "");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/vehicles"
          className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{vehicle.year}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/vehicles/${vehicle.id}/edit`)}>
              Editar
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">Detalhes do veículo</h2>
        </CardHeader>
        <CardBody>
          <dl className="divide-y divide-gray-100 dark:divide-gray-700">
            {infoRows.map((row) => (
              <div key={row.label} className="flex justify-between py-2.5 text-sm">
                <dt className="text-gray-500 dark:text-gray-400">{row.label}</dt>
                <dd className="font-medium text-gray-900 dark:text-white text-right max-w-[60%]">
                  {row.label === "Placa" ? (
                    <span className="uppercase tracking-wider">{row.value}</span>
                  ) : row.label === "Cor" ? (
                    <span className="flex items-center gap-1.5 justify-end">
                      <span className="inline-block h-3 w-3 rounded-full border border-gray-300 dark:border-gray-600" style={{ backgroundColor: row.value as string }} />
                      {row.value}
                    </span>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Histórico de combustível</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/fuel/new`)}>
            Novo
          </Button>
        </CardHeader>
        <CardBody>
          {fuelLogs && fuelLogs.length > 0 ? (
            <div className="space-y-2">
              {fuelLogs.slice(0, 5).map((f) => (
                <div
                  key={f.id}
                  onClick={() => router.push(`/fuel/${f.id}`)}
                  className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(f.date + "T12:00:00").toLocaleDateString("pt-BR")}
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {fuelTypeLabels[f.fuel_type] || f.fuel_type}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {f.liters} L — {f.odometer_km.toLocaleString()} km
                      {f.gas_station && ` — ${f.gas_station}`}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white shrink-0 ml-2">
                    {formatCurrency(f.total_cost)}
                  </p>
                </div>
              ))}
              {fuelLogs.length > 5 && (
                <Link
                  href={`/fuel`}
                  className="block text-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 py-1"
                >
                  Ver todos ({fuelLogs.length})
                </Link>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum abastecimento registrado.</p>
          )}
        </CardBody>
      </Card>

      <div className="mt-6">
        {!confirmDelete ? (
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} className="text-red-600 hover:text-red-700 dark:text-red-400">
            Remover veículo
          </Button>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-400">Tem certeza? As manutenções vinculadas serão removidas.</p>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button size="sm" loading={deleting} onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Sim, remover
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
