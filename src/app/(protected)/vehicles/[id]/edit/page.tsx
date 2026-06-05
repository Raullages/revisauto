"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useVehicle, useUpdateVehicle } from "@/features/vehicles/viewmodel/useVehicles";
import { VehicleForm } from "@/features/vehicles/view/VehicleForm";
import type { VehicleFormData } from "@/features/vehicles/model/schemas";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function EditVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: vehicle, isLoading } = useVehicle(id);
  const { mutateAsync, isPending } = useUpdateVehicle();

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

  const handleSubmit = async (data: VehicleFormData) => {
    try {
      await mutateAsync({ id: vehicle.id, data });
      toast.success("Veículo atualizado!");
      router.push(`/vehicles/${vehicle.id}`);
    } catch {
      toast.error("Erro ao atualizar veículo");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href={`/vehicles/${vehicle.id}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar veículo</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {vehicle.brand} {vehicle.model} ({vehicle.year})
        </p>
      </div>

      <VehicleForm
        defaultValues={vehicle}
        onSubmit={handleSubmit}
        loading={isPending}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
