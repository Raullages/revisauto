"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCreateFuelLog } from "@/features/fuel/viewmodel/useFuel";
import { FuelForm } from "@/features/fuel/view/FuelForm";
import type { FuelFormData } from "@/features/fuel/model/schemas";

export default function NewFuelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync: createFuelLog, isPending } = useCreateFuelLog();
  const openedFromReminder = searchParams.get("source") === "location-reminder";

  const handleSubmit = async (data: FuelFormData) => {
    try {
      await createFuelLog(data);
      toast.success("Abastecimento registrado!");
      router.push("/fuel");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao registrar abastecimento");
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/fuel"
        className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Novo abastecimento
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Registre os dados do abastecimento
      </p>

      {openedFromReminder && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
          Você abriu esta tela a partir de um lembrete inteligente de abastecimento.
        </div>
      )}

      <div className="mt-6">
        <FuelForm
          onSubmit={handleSubmit}
          loading={isPending}
          submitLabel="Registrar abastecimento"
        />
      </div>
    </div>
  );
}
