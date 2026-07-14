"use client";

import { useQuery } from "@tanstack/react-query";
import { billingService } from "../services/billing.service";

export function useCurrentPlan() {
  return useQuery({
    queryKey: ["billing", "plan"],
    queryFn: () => billingService.getCurrentPlan(),
  });
}
