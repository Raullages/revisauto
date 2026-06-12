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
    z.number().min(0, minMessage),
  );

const optionalIntegerField = () =>
  z.preprocess(
    (value) => {
      if (value === "" || value == null) return undefined;
      if (typeof value === "string") return Number(value);
      return value;
    },
    z.number().int().min(0).optional(),
  );

export const maintenanceSchema = z.object({
  vehicle_id: z.string().min(1, "Selecione um veículo"),
  category_id: z.string().min(1, "Selecione uma categoria"),
  title: z.string().min(1, "Título é obrigatório").max(200),
  status: z.enum(["pending", "scheduled", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  description: z.string().max(1000).optional().or(z.literal("")),
  maintenance_date: z.string().optional().or(z.literal("")),
  vehicle_km: requiredIntegerField("KM do veículo é obrigatório", "KM deve ser >= 0"),
  amount: requiredCurrencyField("Valor é obrigatório", "Valor deve ser >= 0"),
  workshop: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  next_change_km: optionalIntegerField(),
  next_change_date: z.string().optional().or(z.literal("")),
}).refine(
  (data) => {
    if (data.status === "completed" || data.status === "scheduled") {
      return !!data.maintenance_date;
    }
    return true;
  },
  { message: "Data é obrigatória para manutenções concluídas ou agendadas", path: ["maintenance_date"] },
);

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

export const maintenanceFormSchema = maintenanceSchema.refine(
  (data) => !data.next_change_km || data.next_change_km > data.vehicle_km,
  {
    message: "KM da próxima troca deve ser maior que o KM atual",
    path: ["next_change_km"],
  },
);
