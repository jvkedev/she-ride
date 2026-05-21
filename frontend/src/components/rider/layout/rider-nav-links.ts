import {
  Car,
  Clock3,
  CreditCard,
  LayoutDashboard,
  MapPinned,
  ShieldCheck,
} from "lucide-react";

export const riderMenuLinks = [
  { label: "Book Ride", href: "/rider", icon: LayoutDashboard },
  { label: "Track Ride", href: "/rider/track", icon: Car },
  { label: "Ride History", href: "/rider/history", icon: Clock3 },
  { label: "Payments", href: "/rider/payments", icon: CreditCard },
  { label: "Saved Places", href: "/rider/saved-places", icon: MapPinned },
  { label: "Safety", href: "/rider/safety", icon: ShieldCheck },
] as const;

/** @deprecated Use riderMenuLinks */
export const riderNavLinks = riderMenuLinks;
