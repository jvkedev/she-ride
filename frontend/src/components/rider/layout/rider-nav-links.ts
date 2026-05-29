import type { LucideIcon } from "lucide-react";
import {
  Car,
  Clock3,
  CreditCard,
  Headphones,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";

export type RiderNavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const riderSidebarLinks: RiderNavLink[] = [
  { label: "Trip", href: "/rider", icon: LayoutDashboard },
  { label: "Track Ride", href: "/rider/track", icon: Car },
  { label: "Ride History", href: "/rider/history", icon: Clock3 },
  { label: "Payments", href: "/rider/payments", icon: CreditCard },
  { label: "Safety", href: "/rider/safety", icon: ShieldCheck },
  { label: "Profile", href: "/rider/profile", icon: User },
  { label: "Support", href: "/rider/support", icon: Headphones },
  { label: "Settings", href: "/rider/settings", icon: Settings },
];

export const riderMobileNavLinks = riderSidebarLinks.filter((link) =>
  ["/rider", "/rider/rentals", "/rider/parcel", "/rider/track"].includes(
    link.href,
  ),
);

/** @deprecated Use riderSidebarLinks */
export const riderMenuLinks = riderSidebarLinks;

/** @deprecated Use riderSidebarLinks */
export const riderNavLinks = riderSidebarLinks;
