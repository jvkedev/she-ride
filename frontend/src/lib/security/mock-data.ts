import type {
  AccountSecurityEvent,
  AuditLogEntry,
  DriverBehaviorProfile,
  DriverVerification,
  FraudAlert,
  MonitoredRide,
  RiskZone,
  SecurityActivity,
  SecurityIncident,
  SecuritySosAlert,
} from "@/lib/security/types";

export const securityOverviewStats = {
  activeSos: 3,
  fraudAttempts: 12,
  suspiciousAccounts: 8,
  highRiskRides: 5,
  blockedUsers: 24,
  openIncidents: 7,
};

export const securityChartData = [
  { day: "Mon", alerts: 18, fraud: 4, sos: 1 },
  { day: "Tue", alerts: 22, fraud: 6, sos: 2 },
  { day: "Wed", alerts: 15, fraud: 3, sos: 0 },
  { day: "Thu", alerts: 28, fraud: 8, sos: 3 },
  { day: "Fri", alerts: 31, fraud: 5, sos: 2 },
  { day: "Sat", alerts: 35, fraud: 7, sos: 4 },
  { day: "Sun", alerts: 20, fraud: 4, sos: 1 },
];

export const securityActivity: SecurityActivity[] = [
  { id: "sa1", message: "Critical SOS on ride RD-8819 — escalation L2", time: "Just now", type: "sos", priority: "critical" },
  { id: "sa2", message: "GPS spoofing detected — Captain Kavita Singh", time: "2 min ago", type: "fraud", priority: "high" },
  { id: "sa3", message: "Route deviation flagged — RD-8821", time: "5 min ago", type: "ride", priority: "medium" },
  { id: "sa4", message: "Failed login burst — rider account r-882", time: "8 min ago", type: "fraud", priority: "medium" },
  { id: "sa5", message: "Incident INC-204 assigned to Security Ops", time: "12 min ago", type: "incident" },
];

export const sosAlerts: SecuritySosAlert[] = [
  { id: "sos-1", rideId: "RD-8819", riderName: "Sneha R.", driverName: "Ritu M.", location: "NH-48, Gurgaon", priority: "critical", status: "critical", triggeredAt: "2 min ago", escalated: true },
  { id: "sos-2", rideId: "RD-8825", riderName: "Ananya K.", driverName: "Priya S.", location: "Sector 62, Noida", priority: "high", status: "in_progress", triggeredAt: "6 min ago", escalated: false },
  { id: "sos-3", rideId: "RD-8812", riderName: "Kavya M.", driverName: "Neha V.", location: "Dwarka Expressway", priority: "medium", status: "resolved", triggeredAt: "1 hr ago", escalated: false },
];

export const fraudAlerts: FraudAlert[] = [
  { id: "fr-1", type: "gps_spoof", user: "Kavita Singh", riskScore: 92, device: "Android 14", ip: "103.21.x.x", status: "pending", detectedAt: "3 min ago" },
  { id: "fr-2", type: "multi_account", user: "Unknown (+91 98xxx)", riskScore: 78, device: "iPhone 15", ip: "49.36.x.x", status: "in_progress", detectedAt: "15 min ago" },
  { id: "fr-3", type: "payment", user: "Meera Shah", riskScore: 65, device: "Web", ip: "182.71.x.x", status: "pending", detectedAt: "32 min ago" },
  { id: "fr-4", type: "login", user: "rider-882", riskScore: 55, device: "Android 12", ip: "45.120.x.x", status: "open", detectedAt: "1 hr ago" },
];

export const securityIncidents: SecurityIncident[] = [
  { id: "INC-204", title: "Harassment report during trip", category: "Passenger safety", reporter: "Rider", status: "in_progress", priority: "high", assignedTo: "Ops Lead", updatedAt: "10 min ago" },
  { id: "INC-203", title: "Wallet charge dispute", category: "Payment", reporter: "Rider", status: "open", priority: "medium", assignedTo: "Unassigned", updatedAt: "2 hr ago" },
  { id: "INC-201", title: "Fake captain profile", category: "Identity", reporter: "System", status: "resolved", priority: "high", assignedTo: "Security", updatedAt: "Yesterday" },
];

export const auditLogs: AuditLogEntry[] = [
  { id: "log-1", actor: "admin@sheride.com", action: "Blocked driver d-5", target: "Sonia Gupta", ip: "10.0.1.42", timestamp: "Today, 3:10 PM" },
  { id: "log-2", actor: "security@sheride.com", action: "Escalated SOS sos-1", target: "RD-8819", ip: "10.0.1.18", timestamp: "Today, 3:05 PM" },
  { id: "log-3", actor: "admin@sheride.com", action: "Approved KYC", target: "Priya Sharma", ip: "10.0.1.42", timestamp: "Today, 2:40 PM" },
];

export const accountEvents: AccountSecurityEvent[] = [
  { id: "ae-1", user: "rider-882", type: "failed_login", device: "Chrome / Windows", location: "Mumbai", ip: "45.120.88.1", time: "8 min ago", blocked: false },
  { id: "ae-2", user: "Unknown", type: "vpn", device: "Android", location: "Proxy detected", ip: "49.36.12.9", time: "20 min ago", blocked: true },
  { id: "ae-3", user: "Ananya Kapoor", type: "new_device", device: "iPhone 16", location: "Delhi", ip: "103.21.44.2", time: "1 hr ago", blocked: false },
];

export const driverVerifications: DriverVerification[] = [
  { id: "d3", name: "Kavita Singh", aadhaar: "pending", license: "pending", insurance: "pending", selfie: "pending", overall: "pending" },
  { id: "d5", name: "Sonia Gupta", aadhaar: "approved", license: "rejected", insurance: "pending", selfie: "rejected", overall: "rejected" },
];

export const monitoredRides: MonitoredRide[] = [
  { id: "RD-8821", riderName: "Ananya K.", driverName: "Priya S.", status: "in_progress", riskLevel: "medium", deviation: false, suspiciousStop: false },
  { id: "RD-8819", riderName: "Sneha R.", driverName: "Ritu M.", status: "in_progress", riskLevel: "critical", deviation: true, suspiciousStop: true },
];

export const riskZones: RiskZone[] = [
  { id: "z1", name: "NH-48 Late Night Corridor", level: "high", activeHours: "10 PM – 5 AM", incidents: 14 },
  { id: "z2", name: "Industrial Area Sector 80", level: "critical", activeHours: "24/7", incidents: 22 },
  { id: "z3", name: "Outer Ring Road East", level: "medium", activeHours: "8 PM – 12 AM", incidents: 8 },
];

export const driverBehavior: DriverBehaviorProfile[] = [
  { id: "d2", name: "Neha Verma", safetyScore: 88, complaints: 2, cancellations: 4, aggressiveFlags: 0, status: "active" },
  { id: "d4", name: "Ritu Malhotra", safetyScore: 72, complaints: 5, cancellations: 12, aggressiveFlags: 2, status: "busy" },
];
