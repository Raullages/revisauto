"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCreateMaintenance } from "@/features/maintenances/viewmodel/useMaintenances";
import { MaintenanceForm } from "@/features/maintenances/view/MaintenanceForm";
import type { MaintenanceFormData } from "@/features/maintenances/model/schemas";

export default function NewMaintenancePage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateMaintenance();

  const handleSubmit = async (data: MaintenanceFormData) => {
    try {
      await mutateAsync(data);
      toast.success("Manutenção registrada!");
      router.push("/maintenances");
    } catch {
      toast.error("Erro ao registrar manutenção");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/maintenances"
          className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nova manutenção</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Registre um serviço realizado
        </p>
      </div>

      <MaintenanceForm onSubmit={handleSubmit} loading={isPending} submitLabel="Registrar" />
    </div>
  );
}
