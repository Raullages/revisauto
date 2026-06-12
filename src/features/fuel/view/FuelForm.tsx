"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fuelSchema, type FuelFormData } from "../model/schemas";
import { useVehicles } from "@/features/vehicles/viewmodel/useVehicles";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { FuelLog } from "../model/types";
import {
  formatCurrencyInput,
  formatIntegerInput,
  parseCurrencyInput,
  parseIntegerInput,
} from "@/utils/form-number-format";

interface FuelFormProps {
  defaultValues?: Partial<FuelLog>;
  onSubmit: (data: FuelFormData) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const fuelTypeLabels: Record<string, string> = {
  gasolina: "Gasolina",
  etanol: "Etanol",
  diesel: "Diesel",
  gnv: "GNV",
};

export function FuelForm({
  defaultValues,
  onSubmit,
  loading = false,
  submitLabel = "Salvar",
}: FuelFormProps) {
  const { data: vehicles } = useVehicles();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FuelFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(fuelSchema) as any,
    defaultValues: defaultValues
      ? {
          vehicle_id: defaultValues.vehicle_id || "",
          date: defaultValues.date || "",
          odometer_km: defaultValues.odometer_km ?? (undefined as unknown as number),
          liters: defaultValues.liters ?? 0,
          total_cost: defaultValues.total_cost ?? (undefined as unknown as number),
          fuel_type: defaultValues.fuel_type || "gasolina",
          is_full_tank: defaultValues.is_full_tank ?? true,
          gas_station: defaultValues.gas_station || "",
          notes: defaultValues.notes || "",
        }
      : {
          vehicle_id: "",
          date: "",
          odometer_km: undefined as unknown as number,
          liters: 0,
          total_cost: undefined as unknown as number,
          fuel_type: "gasolina",
          is_full_tank: true,
          gas_station: "",
          notes: "",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Veículo *
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base md:text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
            {...register("vehicle_id")}
          >
            <option value="">Selecione um veículo...</option>
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

        <Input
          label="Data *"
          type="date"
          error={errors.date?.message}
          {...register("date")}
        />

        <Controller
          control={control}
          name="odometer_km"
          render={({ field }) => (
            <Input
              label="KM (hodômetro) *"
              type="text"
              inputMode="numeric"
              placeholder="Ex: 50.000"
              error={errors.odometer_km?.message}
              value={formatIntegerInput(field.value)}
              onChange={(event) => {
                field.onChange(parseIntegerInput(event.target.value) as unknown as number);
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />

        <Input
          label="Litros *"
          type="number"
          step="0.01"
          placeholder="Ex: 45.5"
          error={errors.liters?.message}
          {...register("liters")}
        />

        <Controller
          control={control}
          name="total_cost"
          render={({ field }) => (
            <Input
              label="Valor Total (R$) *"
              type="text"
              inputMode="decimal"
              placeholder="Ex: R$ 250,00"
              error={errors.total_cost?.message}
              value={formatCurrencyInput(field.value)}
              onChange={(event) => {
                field.onChange(parseCurrencyInput(event.target.value) as unknown as number);
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Combustível *
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base md:text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
            {...register("fuel_type")}
          >
            {Object.entries(fuelTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.fuel_type && (
            <p className="mt-1 text-xs text-red-500">{errors.fuel_type.message}</p>
          )}
        </div>

        <Input
          label="Posto"
          placeholder="Ex: Posto Ipiranga"
          error={errors.gas_station?.message}
          {...register("gas_station")}
        />

        <div className="flex items-center gap-3 pt-1">
          <input
            type="checkbox"
            id="is_full_tank"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            {...register("is_full_tank")}
          />
          <label htmlFor="is_full_tank" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tanque cheio
          </label>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Observações
        </label>
        <textarea
          rows={2}
          placeholder="Anotações adicionais..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base md:text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400"
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
