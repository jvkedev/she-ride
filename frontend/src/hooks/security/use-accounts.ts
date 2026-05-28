import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountSecurityApi } from "@/services/security/security-api";

export const accountKeys = {
  all: () => ["security-accounts"] as const,
  list: (f: Record<string, any>) => ["security-accounts", "list", f] as const,
  stats: () => ["security-accounts", "stats"] as const,
  detail: (id: string) => ["security-accounts", "detail", id] as const,
};

export function useSuspiciousAccounts(filters: { isResolved?: boolean } = {}) {
  return useQuery({
    queryKey: accountKeys.list(filters),
    queryFn: () => accountSecurityApi.getAll(filters),
    staleTime: 30_000,
  });
}

export function useAccountStats() {
  return useQuery({
    queryKey: accountKeys.stats(),
    queryFn: accountSecurityApi.getStats,
    staleTime: 30_000,
  });
}

export function useResolveAccountFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      accountSecurityApi.resolve(id, { notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.all() });
      qc.invalidateQueries({ queryKey: accountKeys.stats() });
    },
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => accountSecurityApi.blockUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountKeys.all() }),
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => accountSecurityApi.unblock(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountKeys.all() }),
  });
}
