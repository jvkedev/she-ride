import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sosApi } from "@/services/security/security-api";

export const sosKeys = {
  all: () => ["sos"] as const,
  active: () => ["sos", "active"] as const,
  stats: () => ["sos", "stats"] as const,
  detail: (id: string) => ["sos", "detail", id] as const,
  history: (riderId: string) => ["sos", "history", riderId] as const,
};

export function useActiveSos() {
  return useQuery({
    queryKey: sosKeys.active(),
    queryFn: sosApi.getActive,
    refetchInterval: 4_000,
  });
}

export function useSosStats() {
  return useQuery({
    queryKey: sosKeys.stats(),
    queryFn: sosApi.getStats,
    staleTime: 30_000,
  });
}

export function useSosAlert(id: string) {
  return useQuery({
    queryKey: sosKeys.detail(id),
    queryFn: () => sosApi.getById(id),
    enabled: Boolean(id),
    refetchInterval: id ? 4_000 : false,
  });
}

export function useMyActiveSos(enabled = true) {
  return useQuery({
    queryKey: ["sos", "mine", "active"],
    queryFn: sosApi.getMyActive,
    enabled,
    refetchInterval: 4_000,
  });
}

export function useResolveSos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      status: "RESOLVED" | "FALSE_ALARM";
      resolutionNote?: string;
    }) => sosApi.resolve(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: sosKeys.active() });
      qc.invalidateQueries({ queryKey: sosKeys.detail(id) });
      qc.invalidateQueries({ queryKey: sosKeys.stats() });
    },
  });
}

export function useDispatchEmergency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      emergencyType: "POLICE" | "AMBULANCE" | "FIRE";
      notes?: string;
    }) => sosApi.dispatch(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: sosKeys.detail(id) });
    },
  });
}
