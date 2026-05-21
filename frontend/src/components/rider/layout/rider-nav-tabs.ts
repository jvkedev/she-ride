import { Car, Key, Package } from "lucide-react";

export const riderNavTabs = [
  { label: "Trip", href: "/rider", icon: Car },
  { label: "Rentals", href: "/rider/rentals", icon: Key },
  { label: "Parcel", href: "/rider/parcel", icon: Package },
] as const;
