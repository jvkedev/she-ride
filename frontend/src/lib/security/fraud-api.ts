// lib/security/fraud-api.ts
// Typed fetch wrappers for every /security/fraud endpoint.

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("accessToken") ?? "";
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Shape mirrors Prisma / backend response ────────────────────────────────

export type FraudRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type FraudStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "FALSE_POSITIVE";
export type FraudType =
  | "GPS_SPOOFING"
  | "MULTI_ACCOUNT"
  | "PAYMENT_FRAUD"
  | "ACCOUNT_TAKEOVER"
  | "FAKE_RIDE"
  | "VPN_PROXY";

export interface FraudCase {
  id: string;
  userId: string;
  rideId: string | null;
  fraudType: FraudType;
  riskLevel: FraudRiskLevel;
  fraudScore: number;
  description: string | null;
  evidence: Record<string, unknown> | null;
  status: FraudStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  ride: { id: string } | null;
}

export interface FraudStats {
  open: number;
  underReview: number;
  resolvedToday: number;
  critical: number;
}

export interface FraudSignal {
  id: string;
  userId: string;
  signalType: string;
  payload: Record<string, unknown>;
  score: number;
  createdAt: string;
}

// ─── GET /security/fraud/stats ───────────────────────────────────────────────

export function fetchFraudStats(): Promise<FraudStats> {
  return apiFetch("/security/fraud/stats");
}

// ─── GET /security/fraud ─────────────────────────────────────────────────────

export interface FraudCaseFilters {
  status?: FraudStatus;
  riskLevel?: FraudRiskLevel;
}

export function fetchFraudCases(
  filters?: FraudCaseFilters,
): Promise<FraudCase[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.riskLevel) params.set("riskLevel", filters.riskLevel);
  const qs = params.toString();
  return apiFetch(`/security/fraud${qs ? `?${qs}` : ""}`);
}

// ─── GET /security/fraud/:id ─────────────────────────────────────────────────

export function fetchFraudCaseById(id: string): Promise<FraudCase> {
  return apiFetch(`/security/fraud/${id}`);
}

// ─── GET /security/fraud/user/:userId/signals ────────────────────────────────

export function fetchUserSignals(userId: string): Promise<FraudSignal[]> {
  return apiFetch(`/security/fraud/user/${userId}/signals`);
}

// ─── PATCH /security/fraud/:id/status ───────────────────────────────────────

export interface UpdateStatusPayload {
  status: "UNDER_REVIEW" | "RESOLVED" | "FALSE_POSITIVE";
  resolutionNote?: string;
}

export function updateFraudCaseStatus(
  id: string,
  payload: UpdateStatusPayload,
): Promise<FraudCase> {
  return apiFetch(`/security/fraud/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

// ─── PATCH /security/fraud/:id/block-user ────────────────────────────────────

export function blockUserFromFraudCase(
  id: string,
): Promise<{ message: string }> {
  return apiFetch(`/security/fraud/${id}/block-user`, { method: "PATCH" });
}

// ─── POST /security/fraud/flag ───────────────────────────────────────────────

export interface FlagCasePayload {
  userId: string;
  fraudType: FraudType;
  riskLevel: FraudRiskLevel;
  fraudScore: number;
  description?: string;
  evidence?: Record<string, unknown>;
  rideId?: string;
}

export function flagFraudCase(payload: FlagCasePayload): Promise<FraudCase> {
  return apiFetch("/security/fraud/flag", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
