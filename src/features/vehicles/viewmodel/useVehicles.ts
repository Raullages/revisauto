"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicleService } from "../services/vehicle.service";
import type { VehicleFormData } from "../model/schemas";

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehicleService.list(),
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => vehicleService.getById(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VehicleFormData) => vehicleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VehicleFormData> }) =>
      vehicleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vehicleService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}
