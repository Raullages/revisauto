"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fuelService } from "../services/fuel.service";
import type { FuelFormData } from "../model/schemas";

export function useFuelLogs(vehicleId?: string) {
  return useQuery({
    queryKey: ["fuelLogs", { vehicleId }],
    queryFn: () => fuelService.list(vehicleId),
  });
}

export function useFuelLogsByVehicle(vehicleId: string) {
  return useQuery({
    queryKey: ["fuelLogs", { vehicleId }],
    queryFn: () => fuelService.listByVehicle(vehicleId),
    enabled: !!vehicleId,
  });
}

export function useFuelLog(id: string) {
  return useQuery({
    queryKey: ["fuelLogs", id],
    queryFn: () => fuelService.getById(id),
    enabled: !!id,
  });
}

export function useCreateFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FuelFormData) => fuelService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuelLogs"] });
      queryClient.invalidateQueries({ queryKey: ["fuelStats"] });
    },
  });
}

export function useUpdateFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FuelFormData> }) =>
      fuelService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuelLogs"] });
      queryClient.invalidateQueries({ queryKey: ["fuelStats"] });
    },
  });
}

export function useDeleteFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fuelService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuelLogs"] });
      queryClient.invalidateQueries({ queryKey: ["fuelStats"] });
    },
  });
}

export function useFuelStats(vehicleId?: string) {
  return useQuery({
    queryKey: ["fuelStats", { vehicleId }],
    queryFn: () => fuelService.getStats(vehicleId),
  });
}
