import { z } from "zod";

export const maintenanceSchema = z.object({
  vehicle_id: z.string().min(1, "Selecione um veiculo"),
  category_id: z.string().min(1, "Selecione uma categoria"),
  title: z.string().min(1, "Titulo e obrigatorio").max(200),
  status: z.enum(["pending", "scheduled", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  description: z.string().max(1000).optional().or(z.literal("")),
  maintenance_date: z.string().optional().or(z.literal("")),
  vehicle_km: z.coerce.number().int().min(0, "KM deve ser >= 0"),
  amount: z.coerce.number().min(0, "Valor deve ser >= 0"),
  workshop: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  next_change_km: z.coerce.number().int().min(0).optional().or(z.literal("")),
  next_change_date: z.string().optional().or(z.literal("")),
}).refine(
  (data) => {
    if (data.status === "completed" || data.status === "scheduled") {
      return !!data.maintenance_date;
    }
    return true;
  },
  { message: "Data e obrigatoria para manutencoes concluidas ou agendadas", path: ["maintenance_date"] },
);

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

export const maintenanceFormSchema = maintenanceSchema.refine(
  (data) => !data.next_change_km || data.next_change_km > data.vehicle_km,
  {
    message: "KM da proxima troca deve ser maior que o KM atual",
    path: ["next_change_km"],
  },
);
