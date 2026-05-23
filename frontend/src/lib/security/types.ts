import type { DashboardStatus } from "@/components/shared/dashboard/status-badge";

export type SecurityPriority = "low" | "medium" | "high" | "critical";

export type SecuritySosAlert = {
  id: string;
  rideId: string;
  riderName: string;
  driverName: string;
  location: string;
  priority: SecurityPriority;
  status: DashboardStatus;
  triggeredAt: string;
  escalated: boolean;
};

export type FraudAlert = {
  id: string;
  type: "gps_spoof" | "multi_account" | "payment" | "login" | "device";
  user: string;
  riskScore: number;
  device: string;
  ip: string;
  status: DashboardStatus;
  detectedAt: string;
};

export type SecurityIncident = {
  id: string;
  title: string;
  category: string;
  reporter: string;
  status: DashboardStatus;
  priority: SecurityPriority;
  assignedTo: string;
  updatedAt: string;
};

export type AuditLogEntry = {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  timestamp: string;
};

export type AccountSecurityEvent = {
  id: string;
  user: string;
  type: "failed_login" | "new_device" | "vpn" | "session";
  device: string;
  location: string;
  ip: string;
  time: string;
  blocked: boolean;
};

export type DriverVerification = {
  id: string;
  name: string;
  aadhaar: DashboardStatus;
  license: DashboardStatus;
  insurance: DashboardStatus;
  selfie: DashboardStatus;
  overall: DashboardStatus;
};

export type SecurityActivity = {
  id: string;
  message: string;
  time: string;
  type: "sos" | "fraud" | "incident" | "audit" | "ride";
  priority?: SecurityPriority;
};

export type MonitoredRide = {
  id: string;
  riderName: string;
  driverName: string;
  status: DashboardStatus;
  riskLevel: SecurityPriority;
  deviation: boolean;
  suspiciousStop: boolean;
};

export type RiskZone = {
  id: string;
  name: string;
  level: SecurityPriority;
  activeHours: string;
  incidents: number;
};

export type DriverBehaviorProfile = {
  id: string;
  name: string;
  safetyScore: number;
  complaints: number;
  cancellations: number;
  aggressiveFlags: number;
  status: DashboardStatus;
};
