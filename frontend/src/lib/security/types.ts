export type SosStatus = "ACTIVE" | "RESOLVED" | "FALSE_ALARM";
export type SosTriggerType = "BUTTON_PRESS" | "AUTO_DETECTED" | "VOICE";
export type EmergencyType = "POLICE" | "AMBULANCE" | "FIRE";
export type EmergencyStatus =
  | "DISPATCHED"
  | "ON_THE_WAY"
  | "ARRIVED"
  | "RESOLVED";

export type FraudType =
  | "FAKE_PAYMENT"
  | "PROMO_ABUSE"
  | "ACCOUNT_TAKEOVER"
  | "ROUTE_MANIPULATION"
  | "FAKE_RATING"
  | "IDENTITY_FRAUD"
  | "MULTIPLE_ACCOUNTS";
export type FraudRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type FraudStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "FALSE_POSITIVE";

export type IncidentType =
  | "HARASSMENT"
  | "ASSAULT"
  | "THEFT"
  | "ACCIDENT"
  | "UNSAFE_DRIVING"
  | "ROUTE_DEVIATION"
  | "OTHER";
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus =
  | "OPEN"
  | "INVESTIGATING"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED";
export type IncidentPriority = "P1" | "P2" | "P3" | "P4";
export type IncidentSource = "APP" | "CALL" | "EMAIL" | "MANUAL";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface SosAlert {
  id: string;
  riderId: string;
  rideId?: string;
  triggerType: SosTriggerType;
  status: SosStatus;
  latitude: number;
  longitude: number;
  address?: string;
  handledBy?: string;
  handledAt?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  rider: { user: { fullName: string; phoneNumber: string } };
  ride?: { pickupAddress: string; dropAddress: string };
  locationSnapshots: {
    latitude: number;
    longitude: number;
    capturedAt: string;
  }[];
  emergencyServices: EmergencyDispatch[];
  createdAt: string;
}

export interface EmergencyDispatch {
  id: string;
  sosAlertId: string;
  emergencyType: EmergencyType;
  status: EmergencyStatus;
  dispatchedBy: string;
  dispatchedAt: string;
  arrivedAt?: string;
  resolvedAt?: string;
  notes?: string;
}

export interface FraudCase {
  id: string;
  userId: string;
  rideId?: string;
  fraudType: FraudType;
  riskLevel: FraudRiskLevel;
  fraudScore: number;
  status: FraudStatus;
  evidence?: Record<string, any>;
  description?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  user: { fullName: string; email: string; phoneNumber: string };
  ride?: { pickupAddress: string; dropAddress: string };
  createdAt: string;
}

export interface SecurityIncident {
  id: string;
  incidentNumber: string;
  reportedBy: string;
  reporterRole: string;
  assignedTo?: string;
  assignedUser?: { id: string; fullName: string };
  rideId?: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  priority: IncidentPriority;
  source: IncidentSource;
  status: IncidentStatus;
  description: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  tags: string[];
  slaDeadline?: string;
  slaBreachedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  user: { id: string; fullName: string; phoneNumber: string; role: string };
  ride?: { id: string; pickupAddress: string; dropAddress: string };
  // from your existing component
  title?: string;
  category?: string;
  reporter?: string;
}

export interface SuspiciousAccount {
  id: string;
  userId: string;
  reasons: string[];
  riskScore: number;
  flaggedBy?: string;
  flaggedAt: string;
  isResolved: boolean;
  resolvedAt?: string;
  notes?: string;
  user: {
    fullName: string;
    email: string;
    phoneNumber: string;
    accountStatus: string;
  };
}

export interface RiskZone {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  centerLatitude: number;
  centerLongitude: number;
  radiusInMeters: number;
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface DriverBehaviorFlag {
  id: string;
  captainId: string;
  rideId?: string;
  flagType: string;
  severity: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  detectedAt: string;
  isReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  captain: { user: { fullName: string; phoneNumber: string } };
  ride?: { pickupAddress: string; dropAddress: string };
}

export interface AuditLog {
  id: string;
  performedBy: string;
  action: string;
  sosAlertId?: string;
  fraudCaseId?: string;
  incidentId?: string;
  suspiciousAccountId?: string;
  metadata?: Record<string, any>;
  previousData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  channel?: string;
  createdAt: string;
}

export interface SecurityStats {
  activeSos: number;
  fraudAttempts: number;
  suspiciousAccounts: number;
  highRiskRides: number;
  blockedUsers: number;
  openIncidents: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // formatted createdAt
  actor: string; // performedBy (could be userId, resolve via user service if needed)
  action: string; // AuditAction enum from Prisma
  target: string; // resolved entity ID (sosAlertId, fraudCaseId, etc.)
  entityType: "sos" | "fraud" | "incident" | "account" | null;
  ip: string | null;
  metadata?: Record<string, any>;
}

export interface AuditLogsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
