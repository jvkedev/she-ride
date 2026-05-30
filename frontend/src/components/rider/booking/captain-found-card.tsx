"use client";

import { Car, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CaptainInfo } from "@/lib/ride/captain-types";
import { cn } from "@/lib/utils";

type CaptainFoundCardProps = {
  captain: CaptainInfo;
  rideStatus?: string;
  etaLabel?: string;
  className?: string;
};

export default function CaptainFoundCard({
  captain,
  rideStatus,
  etaLabel,
  className,
}: CaptainFoundCardProps) {
  const statusLine =
    rideStatus === "ARRIVING"
      ? "Captain is on the way to pickup"
      : rideStatus === "IN_PROGRESS"
        ? "Ride in progress"
        : rideStatus === "ACCEPTED"
          ? "Captain assigned"
          : "Captain found";

  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">
          {statusLine}
        </p>
        {etaLabel && (
          <span className="text-xs font-medium text-neutral-500">{etaLabel}</span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-pink-50">
          <Car className="size-7 text-pink-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-neutral-900">
            {captain.name}
          </p>
          {captain.rating != null && (
            <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-600">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {captain.rating.toFixed(1)}
            </p>
          )}
          {captain.vehicle && (
            <p className="mt-1 text-xs text-neutral-500">
              {captain.vehicle.color} {captain.vehicle.brand}{" "}
              {captain.vehicle.model}
            </p>
          )}
          {captain.vehicle?.plate && (
            <p className="mt-1 inline-block rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-xs font-semibold text-neutral-800">
              {captain.vehicle.plate}
            </p>
          )}
        </div>
        {captain.phone && (
          <Button variant="outline" size="icon" className="shrink-0" asChild>
            <a href={`tel:${captain.phone}`} aria-label="Call captain">
              <Phone className="size-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
