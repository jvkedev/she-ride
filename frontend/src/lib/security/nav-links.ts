import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ClipboardList,
  FileSearch,
  Fingerprint,
  LayoutDashboard,
  Map,
  Radio,
  Shield,
  ShieldAlert,
  UserX,
  Users,
} from "lucide-react";

export type SecurityNavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const securityNavLinks: SecurityNavLink[] = [
  { label: "Overview", href: "/security", icon: LayoutDashboard },
  { label: "SOS Center", href: "/security/sos", icon: ShieldAlert },
  { label: "Live Surveillance", href: "/security/surveillance", icon: Map },
  { label: "Fraud Detection", href: "/security/fraud", icon: Fingerprint },
  { label: "Driver Verification", href: "/security/verification", icon: Shield },
  { label: "Incidents", href: "/security/incidents", icon: AlertTriangle },
  { label: "Account Security", href: "/security/accounts", icon: Users },
  { label: "Risk Zones", href: "/security/zones", icon: Map },
  { label: "Driver Behavior", href: "/security/behavior", icon: UserX },
  { label: "Audit Logs", href: "/security/audit", icon: ClipboardList },
  { label: "Emergency Response", href: "/security/emergency", icon: Radio },
];

export const securityNavGroups = [
  { title: "Monitoring", links: securityNavLinks.slice(0, 4) },
  { title: "Trust & Safety", links: securityNavLinks.slice(4, 8) },
  { title: "Operations", links: securityNavLinks.slice(8) },
];

export const MAP_LAYOUT_ROUTES = ["/security/surveillance", "/security/sos"];
