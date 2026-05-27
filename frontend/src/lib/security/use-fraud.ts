// hooks/security/use-fraud.ts
"use client";
// React Query hooks that wrap every fraud API call.
// Requires @tanstack/react-query v5 installed and a <QueryClientProvider> at the root.

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";

import {
  fetchFraudStats,
  fetchFraudCases,
  fetchFraudCaseById,
  fetchUserSignals,
  updateFraudCaseStatus,
  blockUserFromFraudCase,
  flagFraudCase,
  type FraudCaseFilters,
  type UpdateStatusPayload,
  type FlagCasePayload,
  type FraudCase,
  type FraudStats,
  type FraudSignal,
} from "@/lib/security/fraud-api";

// ─── Query keys ─────────────────────────────────────────────────────────────

export const fraudKeys = {
  all: ["fraud"] as const,
  stats: ["fraud", "stats"] as const,
  cases: (f?: FraudCaseFilters) => ["fraud", "cases", f ?? {}] as const,
  case: (id: string) => ["fraud", "case", id] as const,
  signals: (userId: string) => ["fraud", "signals", userId] as const,
};

// ─── useFraudStats ───────────────────────────────────────────────────────────
// Powers the FraudRiskCards overview.

export function useFraudStats(
  options?: Omit<UseQueryOptions<FraudStats>, "queryKey" | "queryFn">,
) {
  return useQuery<FraudStats>({
    queryKey: fraudKeys.stats,
    queryFn: fetchFraudStats,
    staleTime: 30_000, // refresh every 30 s
    ...options,
  });
}

// ─── useFraudCases ───────────────────────────────────────────────────────────
// Powers the FraudAlertsTable.

export function useFraudCases(filters?: FraudCaseFilters) {
  return useQuery<FraudCase[]>({
    queryKey: fraudKeys.cases(filters),
    queryFn: () => fetchFraudCases(filters),
    staleTime: 15_000,
  });
}

// ─── useFraudCase ────────────────────────────────────────────────────────────
// Powers a detail drawer / page.

export function useFraudCase(id: string) {
  return useQuery<FraudCase>({
    queryKey: fraudKeys.case(id),
    queryFn: () => fetchFraudCaseById(id),
    enabled: Boolean(id),
  });
}

// ─── useUserSignals ──────────────────────────────────────────────────────────

export function useUserSignals(userId: string) {
  return useQuery<FraudSignal[]>({
    queryKey: fraudKeys.signals(userId),
    queryFn: () => fetchUserSignals(userId),
    enabled: Boolean(userId),
  });
}

// ─── useUpdateFraudStatus ────────────────────────────────────────────────────
// PATCH /security/fraud/:id/status

export function useUpdateFraudStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateStatusPayload) =>
      updateFraudCaseStatus(id, payload),

    onSuccess: (updated) => {
      // update the single-case cache immediately
      qc.setQueryData<FraudCase>(fraudKeys.case(updated.id), updated);

      // invalidate list + stats so counts stay correct
      qc.invalidateQueries({ queryKey: ["fraud", "cases"] });
      qc.invalidateQueries({ queryKey: fraudKeys.stats });
    },
  });
}

// ─── useBlockUser ────────────────────────────────────────────────────────────
// PATCH /security/fraud/:id/block-user

export function useBlockUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (fraudCaseId: string) => blockUserFromFraudCase(fraudCaseId),

    onSuccess: (_data, fraudCaseId) => {
      qc.invalidateQueries({ queryKey: fraudKeys.case(fraudCaseId) });
      qc.invalidateQueries({ queryKey: ["fraud", "cases"] });
    },
  });
}

// ─── useFlagFraudCase ────────────────────────────────────────────────────────
// POST /security/fraud/flag  (used by system / admin forms)

export function useFlagFraudCase() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: FlagCasePayload) => flagFraudCase(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fraud", "cases"] });
      qc.invalidateQueries({ queryKey: fraudKeys.stats });
    },
  });
}
