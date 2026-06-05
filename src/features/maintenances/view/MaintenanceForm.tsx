"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { maintenanceSchema, type MaintenanceFormData } from "../model/schemas";
import { useVehicles } from "@/features/vehicles/viewmodel/useVehicles";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Maintenance } from "../model/types";

interface MaintenanceFormProps {
  defaultValues?: Partial<Maintenance>;
  onSubmit: (data: MaintenanceFormData) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

interface Category {
  id: string;
  name: string;
}

export function MaintenanceForm({
  defaultValues,
  onSubmit,
  loading = false,
  submitLabel = "Salvar",
}: MaintenanceFormProps) {
  const { data: vehicles } = useVehicles();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("maintenance_categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaintenanceFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(maintenanceSchema) as any,
    defaultValues: defaultValues
      ? {
          vehicle_id: defaultValues.vehicle_id || "",
          category_id: defaultValues.category_id || "",
          title: defaultValues.title || "",
          description: defaultValues.description || "",
          maintenance_date: defaultValues.maintenance_date || "",
          vehicle_km: defaultValues.vehicle_km ?? 0,
          amount: defaultValues.amount ?? 0,
          workshop: defaultValues.workshop || "",
          notes: defaultValues.notes || "",
          next_change_km: defaultValues.next_change_km ?? ("" as unknown as number),
          next_change_date: defaultValues.next_change_date || "",
        }
      : {
          vehicle_id: "",
          category_id: "",
          title: "",
          description: "",
          maintenance_date: "",
          vehicle_km: 0,
          amount: 0,
          workshop: "",
          notes: "",
          next_change_km: "" as unknown as number,
          next_change_date: "",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Veiculo *
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
            {...register("vehicle_id")}
          >
            <option value="">Selecione um veiculo...</option>
            {vehicles?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model} ({v.year})
              </option>
            ))}
          </select>
          {errors.vehicle_id && (
            <p className="mt-1 text-xs text-red-500">{errors.vehicle_id.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Categoria *
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
            {...register("category_id")}
          >
            <option value="">Selecione uma categoria...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-xs text-red-500">{errors.category_id.message}</p>
          )}
        </div>

        <Input
          label="Titulo *"
          placeholder="Ex: Troca de oleo"
          error={errors.title?.message}
          {...register("title")}
        />

        <Input
          label="Data *"
          type="date"
          error={errors.maintenance_date?.message}
          {...register("maintenance_date")}
        />

        <Input
          label="KM do Veiculo *"
          type="number"
          placeholder="Ex: 50000"
          error={errors.vehicle_km?.message}
          {...register("vehicle_km")}
        />

        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          placeholder="Ex: 250.00"
          error={errors.amount?.message}
          {...register("amount")}
        />

        <Input
          label="Oficina"
          placeholder="Ex: Auto Center ABC"
          error={errors.workshop?.message}
          {...register("workshop")}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descricao
        </label>
        <textarea
          rows={2}
          placeholder="Detalhes do servico realizado..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400"
          {...register("description")}
        />
      </div>

      <fieldset className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <legend className="px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Controle de proxima troca
        </legend>
        <div className="grid gap-4 sm:grid-cols-2 mt-2">
          <Input
            label="KM da proxima troca"
            type="number"
            placeholder="Ex: 60000"
            error={errors.next_change_km?.message}
            {...register("next_change_km")}
          />
          <Input
            label="Data da proxima troca"
            type="date"
            error={errors.next_change_date?.message}
            {...register("next_change_date")}
          />
        </div>
      </fieldset>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Observacoes
        </label>
        <textarea
          rows={2}
          placeholder="Anotacoes adicionais..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400"
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
