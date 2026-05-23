import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Car,
  CircleDollarSign,
  LayoutDashboard,
  MapPin,
  Navigation,
  Settings,
  ShieldAlert,
  Ticket,
  Users,
} from "lucide-react";

export type AdminNavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const adminNavLinks: AdminNavLink[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Drivers", href: "/admin/drivers", icon: Car },
  { label: "Riders", href: "/admin/riders", icon: Users },
  { label: "Rides", href: "/admin/rides", icon: MapPin },
  { label: "Live Tracking", href: "/admin/tracking", icon: Navigation },
  { label: "SOS & Safety", href: "/admin/safety", icon: ShieldAlert },
  { label: "Payments", href: "/admin/payments", icon: CircleDollarSign },
  { label: "Support", href: "/admin/support", icon: Ticket },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export const adminMobileNavLinks = adminNavLinks.filter((link) =>
  ["/admin", "/admin/drivers", "/admin/rides", "/admin/tracking"].includes(
    link.href,
  ),
);
