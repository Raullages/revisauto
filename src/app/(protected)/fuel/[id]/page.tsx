"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useFuelLog, useDeleteFuelLog } from "@/features/fuel/viewmodel/useFuel";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const fuelTypeLabels: Record<string, string> = {
  gasolina: "Gasolina",
  etanol: "Etanol",
  diesel: "Diesel",
  gnv: "GNV",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FuelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: fuelLog, isLoading } = useFuelLog(id);
  const { mutateAsync: deleteFuelLog, isPending: deleting } = useDeleteFuelLog();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!fuelLog) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Abastecimento não encontrado</p>
        <Link href="/fuel" className="mt-2 inline-block text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm">
          Voltar para lista
        </Link>
      </div>
    );
  }

  const pricePerLiter = fuelLog.price_per_liter ?? (fuelLog.total_cost / fuelLog.liters);

  const handleDelete = async () => {
    try {
      await deleteFuelLog(fuelLog.id);
      toast.success("Abastecimento removido");
      router.push("/fuel");
    } catch {
      toast.error("Erro ao remover abastecimento");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/fuel"
          className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {fuelTypeLabels[fuelLog.fuel_type]}
              </span>
              {fuelLog.is_full_tank && (
                <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Tanque cheio
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {fuelLog.vehicles?.brand} {fuelLog.vehicles?.model}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {new Date(fuelLog.date + "T12:00:00").toLocaleDateString("pt-BR")}
              {fuelLog.gas_station && ` — ${fuelLog.gas_station}`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push(`/fuel/${fuelLog.id}/edit`)}>
            Editar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">Detalhes do abastecimento</h2>
        </CardHeader>
        <CardBody>
          <dl className="divide-y divide-gray-100 dark:divide-gray-700">
            <div className="flex justify-between py-2.5 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">KM</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{fuelLog.odometer_km.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between py-2.5 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Litros</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{fuelLog.liters} L</dd>
            </div>
            <div className="flex justify-between py-2.5 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Valor total</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{formatCurrency(fuelLog.total_cost)}</dd>
            </div>
            <div className="flex justify-between py-2.5 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Preço por litro</dt>
              <dd className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(pricePerLiter)}
              </dd>
            </div>
            {fuelLog.notes && (
              <div className="py-2.5 text-sm">
                <dt className="text-gray-500 dark:text-gray-400 mb-1">Observações</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{fuelLog.notes}</dd>
              </div>
            )}
          </dl>
        </CardBody>
      </Card>

      <div className="mt-6">
        {!confirmDelete ? (
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} className="text-red-600 hover:text-red-700 dark:text-red-400">
            Remover abastecimento
          </Button>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-400">Tem certeza? Esta ação não pode ser desfeita.</p>
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
