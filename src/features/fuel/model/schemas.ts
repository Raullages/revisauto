import { z } from "zod";

const requiredIntegerField = (_requiredMessage: string, minMessage: string) =>
  z.preprocess(
    (value) => {
      if (value === "" || value == null) return undefined;
      if (typeof value === "string") return Number(value);
      return value;
    },
    z.number().int().min(0, minMessage),
  );

const requiredCurrencyField = (_requiredMessage: string, minMessage: string) =>
  z.preprocess(
    (value) => {
      if (value === "" || value == null) return undefined;
      if (typeof value === "string") return Number(value);
      return value;
    },
    z.number().min(0.01, minMessage),
  );

export const fuelSchema = z.object({
  vehicle_id: z.string().min(1, "Selecione um veículo"),
  date: z.string().min(1, "Data é obrigatória"),
  odometer_km: requiredIntegerField("KM é obrigatório", "KM deve ser >= 0"),
  liters: z.coerce.number().min(0.01, "Litros deve ser > 0"),
  total_cost: requiredCurrencyField("Valor é obrigatório", "Valor deve ser > 0"),
  fuel_type: z.enum(["gasolina", "etanol", "diesel", "gnv"]),
  is_full_tank: z.boolean(),
  gas_station: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type FuelFormData = z.infer<typeof fuelSchema>;
