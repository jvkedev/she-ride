import api from "@/services/api/axios-client";

// ── SOS ──────────────────────────────────────────────────────────────────────

export const sosApi = {
  getActive: () => api.get("/security/sos/active").then((r) => r.data),
  getStats: () => api.get("/security/sos/stats").then((r) => r.data),
  getById: (id: string) => api.get(`/security/sos/${id}`).then((r) => r.data),
  getRiderHistory: (riderId: string) =>
    api.get(`/security/sos/rider/${riderId}/history`).then((r) => r.data),
  resolve: (
    id: string,
    body: { status: "RESOLVED" | "FALSE_ALARM"; resolutionNote?: string },
  ) => api.patch(`/security/sos/${id}/resolve`, body).then((r) => r.data),
  dispatch: (
    id: string,
    body: { emergencyType: "POLICE" | "AMBULANCE" | "FIRE"; notes?: string },
  ) => api.post(`/security/sos/${id}/dispatch`, body).then((r) => r.data),
};

// ── FRAUD ─────────────────────────────────────────────────────────────────────

export const fraudApi = {
  getAll: (params?: { status?: string; riskLevel?: string }) =>
    api.get("/security/fraud", { params }).then((r) => r.data),
  getStats: () => api.get("/security/fraud/stats").then((r) => r.data),
  getById: (id: string) => api.get(`/security/fraud/${id}`).then((r) => r.data),
  getUserSignals: (userId: string) =>
    api.get(`/security/fraud/user/${userId}/signals`).then((r) => r.data),
  updateStatus: (
    id: string,
    body: {
      status: "UNDER_REVIEW" | "RESOLVED" | "FALSE_POSITIVE";
      resolutionNote?: string;
    },
  ) => api.patch(`/security/fraud/${id}/status`, body).then((r) => r.data),
  blockUser: (id: string) =>
    api.patch(`/security/fraud/${id}/block-user`).then((r) => r.data),
};

// ── INCIDENTS ─────────────────────────────────────────────────────────────────

export const incidentsApi = {
  getAll: (params?: Record<string, any>) =>
    api.get("/security/incidents", { params }).then((r) => r.data),
  getStats: () => api.get("/security/incidents/stats").then((r) => r.data),
  getById: (id: string) =>
    api.get(`/security/incidents/${id}`).then((r) => r.data),
  getTimeline: (id: string) =>
    api.get(`/security/incidents/${id}/timeline`).then((r) => r.data),
  assign: (id: string, body: { assigneeId: string }) =>
    api.patch(`/security/incidents/${id}/assign`, body).then((r) => r.data),
  updateStatus: (id: string, body: { status: string; note?: string }) =>
    api.patch(`/security/incidents/${id}/status`, body).then((r) => r.data),
  updatePriority: (id: string, body: { priority: string }) =>
    api.patch(`/security/incidents/${id}/priority`, body).then((r) => r.data),
  addNote: (id: string, body: { content: string; isInternal?: boolean }) =>
    api.post(`/security/incidents/${id}/notes`, body).then((r) => r.data),
  softDelete: (id: string) =>
    api.delete(`/security/incidents/${id}`).then((r) => r.data),
};

// ── ACCOUNT SECURITY ──────────────────────────────────────────────────────────

export const accountSecurityApi = {
  getAll: (params?: { isResolved?: boolean }) =>
    api.get("/security/accounts", { params }).then((r) => r.data),
  getStats: () => api.get("/security/accounts/stats").then((r) => r.data),
  getById: (id: string) =>
    api.get(`/security/accounts/${id}`).then((r) => r.data),
  flag: (body: {
    userId: string;
    reasons: string[];
    riskScore: number;
    notes?: string;
  }) => api.post("/security/accounts/flag", body).then((r) => r.data),
  resolve: (id: string, body: { notes?: string }) =>
    api.patch(`/security/accounts/${id}/resolve`, body).then((r) => r.data),
  blockUser: (userId: string) =>
    api.patch(`/security/accounts/user/${userId}/block`).then((r) => r.data),
  unblock: (userId: string) =>
    api.patch(`/security/accounts/user/${userId}/unblock`).then((r) => r.data),
};

// ── RISK ZONES ────────────────────────────────────────────────────────────────

export const riskZonesApi = {
  getAll: (params?: { isActive?: boolean; riskLevel?: string }) =>
    api.get("/security/risk-zones", { params }).then((r) => r.data),
  getById: (id: string) =>
    api.get(`/security/risk-zones/${id}`).then((r) => r.data),
  checkPoint: (latitude: number, longitude: number) =>
    api
      .get("/security/risk-zones/check-point", {
        params: { latitude, longitude },
      })
      .then((r) => r.data),
  create: (body: Record<string, any>) =>
    api.post("/security/risk-zones", body).then((r) => r.data),
  update: (id: string, body: Record<string, any>) =>
    api.patch(`/security/risk-zones/${id}`, body).then((r) => r.data),
  delete: (id: string) =>
    api.delete(`/security/risk-zones/${id}`).then((r) => r.data),
};

// ── DRIVER BEHAVIOR ───────────────────────────────────────────────────────────

export const driverBehaviorApi = {
  getAll: (params?: {
    captainId?: string;
    severity?: string;
    isReviewed?: boolean;
  }) => api.get("/security/driver-behavior", { params }).then((r) => r.data),
  getStats: () =>
    api.get("/security/driver-behavior/stats").then((r) => r.data),
  getById: (id: string) =>
    api.get(`/security/driver-behavior/${id}`).then((r) => r.data),
  getCaptainList: () =>
    api.get("/security/driver-behavior/captains").then((r) => r.data),
  getCaptainSummary: (captainId: string) =>
    api
      .get(`/security/driver-behavior/captain/${captainId}/summary`)
      .then((r) => r.data),
  review: (id: string) =>
    api.patch(`/security/driver-behavior/${id}/review`).then((r) => r.data),
};
// ── AUDIT LOGS ────────────────────────────────────────────────────────────────

export const auditApi = {
  getAll: (params?: {
    performedBy?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) => api.get("/security/audit", { params }).then((r) => r.data),
  getStats: () => api.get("/security/audit/stats").then((r) => r.data),
  getByEntity: (
    entity: "sos" | "fraud" | "incident" | "account",
    entityId: string,
  ) => api.get(`/security/audit/${entity}/${entityId}`).then((r) => r.data),
};

export const SECURITY_WS_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
