import { z } from "zod";

export const fuelSchema = z.object({
  vehicle_id: z.string().min(1, "Selecione um veículo"),
  date: z.string().min(1, "Data é obrigatória"),
  odometer_km: z.coerce.number().int().min(0, "KM deve ser >= 0"),
  liters: z.coerce.number().min(0.01, "Litros deve ser > 0"),
  total_cost: z.coerce.number().min(0.01, "Valor deve ser > 0"),
  fuel_type: z.enum(["gasolina", "etanol", "diesel", "gnv"]),
  is_full_tank: z.boolean(),
  gas_station: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type FuelFormData = z.infer<typeof fuelSchema>;
