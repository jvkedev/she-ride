import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fraudApi } from "@/services/security/security-api";

export const fraudKeys = {
  all: () => ["fraud"] as const,
  list: (f: Record<string, any>) => ["fraud", "list", f] as const,
  stats: () => ["fraud", "stats"] as const,
  detail: (id: string) => ["fraud", "detail", id] as const,
  signals: (userId: string) => ["fraud", "signals", userId] as const,
};

export function useFraudCases(
  filters: { status?: string; riskLevel?: string } = {},
) {
  return useQuery({
    queryKey: fraudKeys.list(filters),
    queryFn: () => fraudApi.getAll(filters),
    staleTime: 30_000,
  });
}

export function useFraudStats() {
  return useQuery({
    queryKey: fraudKeys.stats(),
    queryFn: fraudApi.getStats,
    staleTime: 30_000,
  });
}

export function useFraudCase(id: string) {
  return useQuery({
    queryKey: fraudKeys.detail(id),
    queryFn: () => fraudApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useUpdateFraudStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      status: "UNDER_REVIEW" | "RESOLVED" | "FALSE_POSITIVE";
      resolutionNote?: string;
    }) => fraudApi.updateStatus(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: fraudKeys.detail(id) });
      qc.invalidateQueries({ queryKey: fraudKeys.all() });
      qc.invalidateQueries({ queryKey: fraudKeys.stats() });
    },
  });
}

export function useBlockUserFromFraud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fraudApi.blockUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fraudKeys.all() });
    },
  });
}
