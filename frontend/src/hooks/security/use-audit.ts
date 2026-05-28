import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/services/security/security-api";

export const auditKeys = {
  all: () => ["audit"] as const,
  list: (f: Record<string, any>) => ["audit", "list", f] as const,
  stats: () => ["audit", "stats"] as const,
  entity: (entity: string, id: string) => ["audit", entity, id] as const,
};

export function useAuditLogs(
  filters: {
    performedBy?: string;
    action?: string;
    from?: string;
    to?: string;
  } = {},
) {
  return useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: () => auditApi.getAll(filters),
    staleTime: 30_000,
  });
}

export function useAuditStats() {
  return useQuery({
    queryKey: auditKeys.stats(),
    queryFn: auditApi.getStats,
    staleTime: 30_000,
  });
}

export function useEntityAuditLogs(
  entity: "sos" | "fraud" | "incident" | "account",
  entityId: string,
) {
  return useQuery({
    queryKey: auditKeys.entity(entity, entityId),
    queryFn: () => auditApi.getByEntity(entity, entityId),
    enabled: Boolean(entityId),
  });
}
