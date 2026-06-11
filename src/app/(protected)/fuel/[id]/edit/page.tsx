"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useFuelLog, useUpdateFuelLog } from "@/features/fuel/viewmodel/useFuel";
import { FuelForm } from "@/features/fuel/view/FuelForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { FuelFormData } from "@/features/fuel/model/schemas";

export default function EditFuelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: fuelLog, isLoading } = useFuelLog(id);
  const { mutateAsync: updateFuelLog, isPending } = useUpdateFuelLog();

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

  const handleSubmit = async (data: FuelFormData) => {
    try {
      await updateFuelLog({ id, data });
      toast.success("Abastecimento atualizado!");
      router.push(`/fuel/${id}`);
    } catch {
      toast.error("Erro ao atualizar abastecimento");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/fuel/${id}`}
        className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Editar abastecimento
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {fuelLog.vehicles?.brand} {fuelLog.vehicles?.model}
      </p>

      <div className="mt-6">
        <FuelForm
          defaultValues={fuelLog}
          onSubmit={handleSubmit}
          loading={isPending}
          submitLabel="Atualizar abastecimento"
        />
      </div>
    </div>
  );
}
