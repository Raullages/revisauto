"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema } from "../model/schemas";
import type { VehicleFormData } from "../model/schemas";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Vehicle } from "../model/types";

const fuelOptions = [
  { value: "", label: "Selecione..." },
  { value: "Gasolina", label: "Gasolina" },
  { value: "Etanol", label: "Etanol" },
  { value: "Flex", label: "Flex" },
  { value: "Diesel", label: "Diesel" },
  { value: "GNV", label: "GNV" },
  { value: "Elétrico", label: "Elétrico" },
  { value: "Híbrido", label: "Híbrido" },
];

interface VehicleFormProps {
  defaultValues?: Partial<Vehicle>;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const fuelValues = ["", "Gasolina", "Etanol", "Flex", "Diesel", "GNV", "Elétrico", "Híbrido"] as const;

function toFuelValue(value: string | null | undefined): "" | "Gasolina" | "Etanol" | "Flex" | "Diesel" | "GNV" | "Elétrico" | "Híbrido" {
  if (value && fuelValues.includes(value as typeof fuelValues[number])) {
    return value as typeof fuelValues[number];
  }
  return "";
}

export function VehicleForm({
  defaultValues,
  onSubmit,
  loading = false,
  submitLabel = "Salvar",
}: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: defaultValues
      ? {
          brand: defaultValues.brand || "",
          model: defaultValues.model || "",
          year: defaultValues.year ?? undefined,
          version: defaultValues.version || "",
          plate: defaultValues.plate || "",
          color: defaultValues.color || "",
          fuel: toFuelValue(defaultValues.fuel),
          current_km: defaultValues.current_km ?? 0,
          chassis: defaultValues.chassis || "",
          renavam: defaultValues.renavam || "",
          acquisition_date: defaultValues.acquisition_date || "",
          notes: defaultValues.notes || "",
        }
      : {
          brand: "",
          model: "",
          year: undefined,
          version: "",
          plate: "",
          color: "",
          fuel: "" as const,
          current_km: 0,
          chassis: "",
          renavam: "",
          acquisition_date: "",
          notes: "",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Marca *"
          placeholder="Ex: Toyota"
          error={errors.brand?.message}
          {...register("brand")}
        />
        <Input
          label="Modelo *"
          placeholder="Ex: Corolla"
          error={errors.model?.message}
          {...register("model")}
        />
        <Input
          label="Ano *"
          type="number"
          placeholder="Ex: 2022"
          error={errors.year?.message}
          {...register("year")}
        />
        <Input
          label="Versao"
          placeholder="Ex: XEI 2.0"
          error={errors.version?.message}
          {...register("version")}
        />
        <Input
          label="Placa"
          placeholder="Ex: ABC1D23"
          error={errors.plate?.message}
          {...register("plate")}
        />
        <Input
          label="Cor"
          placeholder="Ex: Prata"
          error={errors.color?.message}
          {...register("color")}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Combustivel
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
            {...register("fuel")}
          >
            {fuelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="KM Atual *"
          type="number"
          placeholder="Ex: 50000"
          error={errors.current_km?.message}
          {...register("current_km")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Chassi"
          placeholder="Ex: 9BW..."
          error={errors.chassis?.message}
          {...register("chassis")}
        />
        <Input
          label="Renavam"
          placeholder="Ex: 12345678901"
          error={errors.renavam?.message}
          {...register("renavam")}
        />
        <Input
          label="Data de Aquisicao"
          type="date"
          error={errors.acquisition_date?.message}
          {...register("acquisition_date")}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Observações
        </label>
        <textarea
          rows={3}
          placeholder="Anotações sobre o veículo..."
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
