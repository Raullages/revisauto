"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useMaintenance, useUpdateMaintenance } from "@/features/maintenances/viewmodel/useMaintenances";
import { MaintenanceForm } from "@/features/maintenances/view/MaintenanceForm";
import type { MaintenanceFormData } from "@/features/maintenances/model/schemas";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function EditMaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: maintenance, isLoading } = useMaintenance(id);
  const { mutateAsync, isPending } = useUpdateMaintenance();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Manutencao nao encontrada</p>
        <Link href="/maintenances" className="mt-2 inline-block text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm">
          Voltar para lista
        </Link>
      </div>
    );
  }

  const handleSubmit = async (data: MaintenanceFormData) => {
    try {
      await mutateAsync({ id: maintenance.id, data });
      toast.success("Manutencao atualizada!");
      router.push(`/maintenances/${maintenance.id}`);
    } catch {
      toast.error("Erro ao atualizar manutencao");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/maintenances/${maintenance.id}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar manutencao</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {maintenance.title}
        </p>
      </div>

      <MaintenanceForm
        defaultValues={maintenance}
        onSubmit={handleSubmit}
        loading={isPending}
        submitLabel="Salvar alteracoes"
      />
    </div>
  );
}
