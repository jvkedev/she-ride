"use client";

import { useEffect, useMemo, useState } from "react";
import { Car, Loader2, Phone, RefreshCw } from "lucide-react";

import LiveTrackingMap from "@/components/security/maps/live-tracking-map";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  buildSurveillanceMarkers,
  type LiveActiveRide,
} from "@/lib/security/surveillance-markers";
import { cn } from "@/lib/utils";
import { fetchLiveOperations } from "@/services/security/security-profile.service";

function ContactChip({
  label,
  name,
  phone,
}: {
  label: string;
  name: string;
  phone?: string | null;
}) {
  return (
    <div className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      <p className="text-sm font-medium text-neutral-900">{name}</p>
      {phone && (
        <a
          href={`tel:${phone}`}
          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-pink-600"
        >
          <Phone className="h-3 w-3" />
          {phone}
        </a>
      )}
    </div>
  );
}

export default function SurveillancePanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [activeRides, setActiveRides] = useState<LiveActiveRide[]>([]);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchLiveOperations();
      setActiveRides(data.activeRides);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5_000);
    return () => clearInterval(interval);
  }, []);

  const selectedRide =
    activeRides.find((r) => r.id === selectedRideId) ?? null;

  const { markers, routeLine } = useMemo(
    () => buildSurveillanceMarkers(activeRides, selectedRideId),
    [activeRides, selectedRideId],
  );

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,300px)_1fr] lg:p-5">
      <div className="dashboard-panel-scroll space-y-3 overflow-y-auto p-4 lg:p-0">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-neutral-900">
            Active rides
          </h2>
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg"
            onClick={load}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-neutral-500">
          Select a ride to view pickup, drop, and captain live location.
        </p>

        {loading && activeRides.length === 0 ? (
          <div className="flex items-center gap-2 py-8 text-sm text-neutral-500">
            <Loader2 className="size-4 animate-spin" />
            Loading rides…
          </div>
        ) : error ? (
          <SurfaceCard padding="sm">
            <p className="text-sm text-red-600">Failed to load live rides.</p>
          </SurfaceCard>
        ) : activeRides.length === 0 ? (
          <SurfaceCard padding="sm">
            <p className="text-sm text-neutral-500">No active rides right now.</p>
          </SurfaceCard>
        ) : (
          activeRides.map((ride) => (
            <button
              key={ride.id}
              type="button"
              onClick={() =>
                setSelectedRideId((prev) =>
                  prev === ride.id ? null : ride.id,
                )
              }
              className={cn(
                "w-full rounded-xl border p-3 text-left transition",
                selectedRideId === ride.id
                  ? "border-indigo-300 bg-indigo-50/80 ring-2 ring-indigo-200"
                  : "border-neutral-200 bg-white hover:border-indigo-200",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-neutral-700">
                  {ride.id.slice(0, 8)}
                </span>
                <StatusBadge status={ride.status} />
              </div>
              <p className="mt-1 text-sm font-medium text-neutral-900">
                {ride.riderName}
              </p>
              {ride.captainName && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-600">
                  <Car className="h-3 w-3" />
                  {ride.captainName}
                </p>
              )}
              <p className="mt-2 line-clamp-1 text-xs text-neutral-600">
                {ride.pickup}
              </p>
              <p className="line-clamp-1 text-xs text-neutral-500">
                → {ride.dropoff}
              </p>
              {ride.captainLat != null && (
                <p className="mt-1 text-[10px] text-emerald-600">
                  Captain GPS live
                </p>
              )}
            </button>
          ))
        )}

        {selectedRide && (
          <SurfaceCard padding="sm" className="space-y-2">
            <h3 className="text-sm font-semibold text-neutral-900">
              Ride contacts
            </h3>
            <ContactChip
              label="Rider"
              name={selectedRide.riderName}
              phone={selectedRide.riderPhone}
            />
            {selectedRide.captainName && (
              <ContactChip
                label="Captain"
                name={selectedRide.captainName}
                phone={selectedRide.captainPhone}
              />
            )}
          </SurfaceCard>
        )}
      </div>

      <div className="flex min-h-[320px] flex-1 flex-col gap-3 p-4 pt-0 lg:p-0">
        <LiveTrackingMap
          className="min-h-[400px] flex-1"
          markers={markers}
          routeLine={routeLine}
          followSelected={Boolean(selectedRide)}
          overlay={
            <div className="rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs font-medium text-neutral-900 shadow-sm backdrop-blur-sm">
              Live surveillance · {activeRides.length} active ride
              {activeRides.length !== 1 ? "s" : ""}
              {selectedRide
                ? ` · ${selectedRide.riderName}`
                : " · tap a ride to focus"}
            </div>
          }
        />

        <div className="flex flex-wrap justify-center gap-4 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-base leading-none">🚗</span>
            Captain (live)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            Pickup
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Drop
          </span>
        </div>
      </div>
    </div>
  );
}
