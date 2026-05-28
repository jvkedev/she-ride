import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { driverBehaviorApi } from "@/services/security/security-api";

export const behaviorKeys = {
  all: () => ["driver-behavior"] as const,
  list: (f: Record<string, any>) => ["driver-behavior", "list", f] as const,
  stats: () => ["driver-behavior", "stats"] as const,
  detail: (id: string) => ["driver-behavior", "detail", id] as const,
  captain: (captainId: string) =>
    ["driver-behavior", "captain", captainId] as const,
};

export function useDriverBehaviorFlags(
  filters: { captainId?: string; severity?: string; isReviewed?: boolean } = {},
) {
  return useQuery({
    queryKey: behaviorKeys.list(filters),
    queryFn: () => driverBehaviorApi.getAll(filters),
    staleTime: 30_000,
  });
}

export function useBehaviorStats() {
  return useQuery({
    queryKey: behaviorKeys.stats(),
    queryFn: driverBehaviorApi.getStats,
    staleTime: 30_000,
  });
}

export function useCaptainBehaviorSummary(captainId: string) {
  return useQuery({
    queryKey: behaviorKeys.captain(captainId),
    queryFn: () => driverBehaviorApi.getCaptainSummary(captainId),
    enabled: Boolean(captainId),
  });
}

export function useCaptainList() {
  return useQuery({
    queryKey: ["driver-behavior", "captains"],
    queryFn: driverBehaviorApi.getCaptainList,
    staleTime: 30_000,
  });
}

export function useReviewFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => driverBehaviorApi.review(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: behaviorKeys.all() });
      qc.invalidateQueries({ queryKey: behaviorKeys.stats() });
    },
  });
}
