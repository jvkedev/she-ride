import type { LucideIcon } from "lucide-react";
import {
  Car,
  CircleDollarSign,
  FileText,
  Headphones,
  History,
  LayoutDashboard,
  MapPin,
  Settings,
  Shield,
  Wallet,
  Zap,
} from "lucide-react";

export type CaptainNavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const captainNavLinks: CaptainNavLink[] = [
  {
    label: "Dashboard",
    href: "/captain",
    icon: LayoutDashboard,
    description: "Overview & live map",
  },
  {
    label: "Ride Requests",
    href: "/captain/requests",
    icon: Zap,
    description: "Incoming bookings",
  },
  {
    label: "Active Ride",
    href: "/captain/active-ride",
    icon: MapPin,
    description: "Current trip",
  },
  {
    label: "Ride History",
    href: "/captain/ride-history",
    icon: History,
  },
  {
    label: "Earnings",
    href: "/captain/earnings",
    icon: CircleDollarSign,
  },
  {
    label: "Wallet",
    href: "/captain/wallet",
    icon: Wallet,
  },
  {
    label: "Vehicle",
    href: "/captain/vehicle",
    icon: Car,
  },
  {
    label: "Documents",
    href: "/captain/documents",
    icon: FileText,
  },
  {
    label: "Safety",
    href: "/captain/safety",
    icon: Shield,
  },
  {
    label: "Support",
    href: "/captain/support",
    icon: Headphones,
  },
  {
    label: "Settings",
    href: "/captain/settings",
    icon: Settings,
  },
];

export const captainMobileNavLinks = captainNavLinks.filter((link) =>
  ["/captain", "/captain/requests", "/captain/active-ride", "/captain/earnings"].includes(
    link.href,
  ),
);
