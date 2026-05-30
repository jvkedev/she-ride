"use client";

import {
  getLocationSourceLabel,
  type LocationSource,
} from "@/lib/maps/geolocation";
import { cn } from "@/lib/utils";

type LocationSourceIndicatorProps = {
  source: LocationSource;
  accuracyM?: number;
  className?: string;
};

export default function LocationSourceIndicator({
  source,
  accuracyM,
  className,
}: LocationSourceIndicatorProps) {
  if (process.env.NODE_ENV === "production") return null;

  const isApproximate = source === "ip" || source === "network";
  const isPoor = accuracyM != null && accuracyM > 1000;

  return (
    <div
      className={cn(
        "pointer-events-none absolute right-4 top-4 z-30 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm",
        isApproximate || isPoor
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
        className,
      )}
    >
      {getLocationSourceLabel(source)}
      {accuracyM != null ? ` · ±${Math.round(accuracyM)}m` : null}
    </div>
  );
}
