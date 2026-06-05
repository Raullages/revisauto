import { z } from "zod";

const currentYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  brand: z.string().min(1, "Marca é obrigatória").max(100),
  model: z.string().min(1, "Modelo é obrigatório").max(100),
  year: z.coerce.number().int().min(1900, "Ano inválido").max(currentYear + 1, "Ano inválido"),
  version: z.string().max(100).optional().or(z.literal("")),
  plate: z.string().max(10).optional().or(z.literal("")),
  color: z.string().max(50).optional().or(z.literal("")),
  fuel: z
    .enum(["", "Gasolina", "Etanol", "Flex", "Diesel", "GNV", "Elétrico", "Híbrido"])
    .optional()
    .or(z.literal("")),
  current_km: z.coerce.number().int().min(0, "KM deve ser >= 0"),
  chassis: z.string().max(30).optional().or(z.literal("")),
  renavam: z.string().max(20).optional().or(z.literal("")),
  acquisition_date: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
