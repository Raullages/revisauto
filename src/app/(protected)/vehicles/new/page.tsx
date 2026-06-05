"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCreateVehicle } from "@/features/vehicles/viewmodel/useVehicles";
import { VehicleForm } from "@/features/vehicles/view/VehicleForm";
import type { VehicleFormData } from "@/features/vehicles/model/schemas";
import Link from "next/link";

export default function NewVehiclePage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateVehicle();

  const handleSubmit = async (data: VehicleFormData) => {
    try {
      await mutateAsync(data);
      toast.success("Veiculo cadastrado!");
      router.push("/vehicles");
    } catch {
      toast.error("Erro ao cadastrar veiculo");
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novo veiculo</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Preencha os dados do veiculo
        </p>
      </div>

      <VehicleForm onSubmit={handleSubmit} loading={isPending} submitLabel="Cadastrar" />
    </div>
  );
}
