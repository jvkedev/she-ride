import type { SecurityIncident } from "@/lib/security/types";

// Defined here so the frontend doesn't depend on @prisma/client
export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface IncidentStats {
  open: number;
  investigating: number;
  resolvedToday: number;
  critical: number;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function getAuthHeader(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PaginatedIncidents {
  data: SecurityIncident[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

// ── Query helpers ─────────────────────────────────────────────────────────────

export interface GetIncidentsParams {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
}

export const incidentsApi = {
  /** GET /security/incidents */
  async getAll(params: GetIncidentsParams = {}): Promise<SecurityIncident[]> {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    if (params.severity) qs.set("severity", params.severity);
    const query = qs.toString() ? `?${qs}` : "";
    const res = await apiFetch<PaginatedIncidents | SecurityIncident[]>(
      `/security/incidents${query}`,
    );
    return Array.isArray(res) ? res : res.data;
  },

  /** GET /security/incidents/stats */
  getStats(): Promise<IncidentStats> {
    return apiFetch("/security/incidents/stats");
  },

  /** GET /security/incidents/:id */
  getById(id: string): Promise<SecurityIncident> {
    return apiFetch(`/security/incidents/${id}`);
  },

  /** GET /security/incidents/:id/timeline */
  getTimeline(id: string): Promise<any[]> {
    return apiFetch(`/security/incidents/${id}/timeline`);
  },

  /** PATCH /security/incidents/:id/assign */
  assign(id: string, body: { assigneeId: string }): Promise<SecurityIncident> {
    return apiFetch(`/security/incidents/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /** PATCH /security/incidents/:id/status */
  updateStatus(
    id: string,
    body: { status: string; note?: string },
  ): Promise<SecurityIncident> {
    return apiFetch(`/security/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /** PATCH /security/incidents/:id/priority */
  updatePriority(
    id: string,
    body: { priority: string },
  ): Promise<SecurityIncident> {
    return apiFetch(`/security/incidents/${id}/priority`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /** POST /security/incidents/:id/notes */
  addNote(
    id: string,
    body: { content: string; isInternal?: boolean },
  ): Promise<any> {
    return apiFetch(`/security/incidents/${id}/notes`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  /** PATCH /security/incidents/:id/resolve */
  resolve(
    id: string,
    body: { status: "RESOLVED" | "CLOSED"; resolutionNote?: string },
  ): Promise<SecurityIncident> {
    return apiFetch(`/security/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: body.status, note: body.resolutionNote }),
    });
  },

  /** DELETE /security/incidents/:id */
  softDelete(id: string): Promise<void> {
    return apiFetch(`/security/incidents/${id}`, { method: "DELETE" });
  },

  getAssignees(): Promise<{ id: string; fullName: string; role: string }[]> {
    return apiFetch("/security/accounts/assignees");
  },
};
