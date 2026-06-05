"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceService } from "../services/maintenance.service";
import type { MaintenanceFormData } from "../model/schemas";

export function useMaintenances() {
  return useQuery({
    queryKey: ["maintenances"],
    queryFn: () => maintenanceService.list(),
  });
}

export function useMaintenancesByVehicle(vehicleId: string) {
  return useQuery({
    queryKey: ["maintenances", { vehicleId }],
    queryFn: () => maintenanceService.listByVehicle(vehicleId),
    enabled: !!vehicleId,
  });
}

export function useMaintenance(id: string) {
  return useQuery({
    queryKey: ["maintenances", id],
    queryFn: () => maintenanceService.getById(id),
    enabled: !!id,
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MaintenanceFormData) => maintenanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MaintenanceFormData> }) =>
      maintenanceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => maintenanceService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
}
