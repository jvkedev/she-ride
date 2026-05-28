import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { riskZonesApi } from "@/services/security/security-api";

export const riskZoneKeys = {
  all: () => ["risk-zones"] as const,
  list: (f: Record<string, any>) => ["risk-zones", "list", f] as const,
  detail: (id: string) => ["risk-zones", "detail", id] as const,
};

export function useRiskZones(
  filters: { isActive?: boolean; riskLevel?: string } = {},
) {
  return useQuery({
    queryKey: riskZoneKeys.list(filters),
    queryFn: () => riskZonesApi.getAll(filters),
    staleTime: 60_000,
  });
}

export function useCreateRiskZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: riskZonesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: riskZoneKeys.all() }),
  });
}

export function useDeleteRiskZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: riskZonesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: riskZoneKeys.all() }),
  });
}
