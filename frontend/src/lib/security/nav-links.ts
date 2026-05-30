import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ClipboardList,
  FileSearch,
  Fingerprint,
  LayoutDashboard,
  Shield,
  ShieldAlert,
  User,
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
  { label: "Profile", href: "/security/profile", icon: User },
  { label: "SOS Center", href: "/security/sos", icon: ShieldAlert },
  { label: "Live Surveillance", href: "/security/surveillance", icon: FileSearch },
  { label: "Fraud Detection", href: "/security/fraud", icon: Fingerprint },
  {
    label: "Driver Verification",
    href: "/security/verification",
    icon: Shield,
  },
  { label: "Incidents", href: "/security/incidents", icon: AlertTriangle },
  { label: "Account Security", href: "/security/accounts", icon: Users },
  { label: "Driver Behavior", href: "/security/behavior", icon: UserX },
  { label: "Audit Logs", href: "/security/audit", icon: ClipboardList },
];

export const securityMobileNavLinks = securityNavLinks.filter((link) =>
  [
    "/security",
    "/security/sos",
    "/security/surveillance",
    "/security/verification",
  ].includes(link.href),
);

export const MAP_LAYOUT_ROUTES = ["/security/surveillance", "/security/sos"];
