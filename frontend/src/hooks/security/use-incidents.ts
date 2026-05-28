import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  incidentsApi,
  type GetIncidentsParams,
} from "@/lib/security/incidents.api";

export const incidentKeys = {
  all: () => ["incidents"] as const,
  list: (f: GetIncidentsParams) => ["incidents", "list", f] as const,
  detail: (id: string) => ["incidents", "detail", id] as const,
  timeline: (id: string) => ["incidents", "detail", id, "timeline"] as const,
  stats: () => ["incidents", "stats"] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useIncidents(filters: GetIncidentsParams = {}) {
  return useQuery({
    queryKey: incidentKeys.list(filters),
    queryFn: () => incidentsApi.getAll(filters),
    staleTime: 30_000,
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: () => incidentsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useIncidentTimeline(id: string) {
  return useQuery({
    queryKey: incidentKeys.timeline(id),
    queryFn: () => incidentsApi.getTimeline(id),
    enabled: Boolean(id),
  });
}

export function useIncidentStats() {
  return useQuery({
    queryKey: incidentKeys.stats(),
    queryFn: incidentsApi.getStats,
    staleTime: 60_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useAssignIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string }) =>
      incidentsApi.assign(id, { assigneeId }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: incidentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: incidentKeys.all() });
    },
  });
}

export function useUpdateIncidentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      status: string;
      note?: string;
    }) => incidentsApi.updateStatus(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: incidentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: incidentKeys.all() });
      qc.invalidateQueries({ queryKey: incidentKeys.stats() });
    },
  });
}

export function useUpdateIncidentPriority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: string }) =>
      incidentsApi.updatePriority(id, { priority }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: incidentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: incidentKeys.all() });
    },
  });
}

export function useAddIncidentNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      content: string;
      isInternal?: boolean;
    }) => incidentsApi.addNote(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: incidentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: incidentKeys.timeline(id) });
    },
  });
}

export function useResolveIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      status: "RESOLVED" | "CLOSED";
      resolutionNote?: string;
    }) => incidentsApi.resolve(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: incidentKeys.detail(id) });
      qc.invalidateQueries({ queryKey: incidentKeys.all() });
      qc.invalidateQueries({ queryKey: incidentKeys.stats() });
    },
  });
}

export function useSoftDeleteIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => incidentsApi.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incidentKeys.all() });
      qc.invalidateQueries({ queryKey: incidentKeys.stats() });
    },
  });
}

export function useAssignees() {
  return useQuery({
    queryKey: ["incident-assignees"],
    queryFn: incidentsApi.getAssignees,
    staleTime: 60_000,
  });
}
