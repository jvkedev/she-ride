"use client";

import { useEffect, useState } from "react";
import { Car, MapPin, Users } from "lucide-react";

import AdminFleetMap from "@/components/admin/tracking/admin-fleet-map";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatWidget from "@/components/shared/dashboard/stat-widget";
import {
  fetchLiveOperations,
  type AdminLiveOperations,
} from "@/services/admin/admin.service";

export default function LiveTrackingPanel() {
  const [ops, setOps] = useState<AdminLiveOperations | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchLiveOperations();
        if (!cancelled) setOps(data);
      } catch (error) {
        console.error("Live ops load failed:", error);
      }
    }

    load();
    const interval = setInterval(load, 8_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const stats = ops?.stats ?? {
    activeRides: 0,
    onlineCaptains: 0,
    ridersOnTrip: 0,
    activeSos: 0,
  };

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:p-5">
      <div className="dashboard-panel-scroll space-y-3 overflow-y-auto p-4 lg:p-0">
        <StatWidget
          label="Active rides"
          value={String(stats.activeRides)}
          icon={MapPin}
          accent="primary"
        />
        <StatWidget
          label="Online captains"
          value={String(stats.onlineCaptains)}
          icon={Car}
        />
        <StatWidget
          label="On map (GPS)"
          value={String(ops?.captains.length ?? 0)}
          icon={Users}
        />
        <SurfaceCard padding="sm">
          <h3 className="text-xs font-semibold text-neutral-900">Map legend</h3>
          <ul className="mt-3 space-y-2 text-xs text-neutral-600">
            <li className="flex items-center gap-2">
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#ff2e6d] text-[10px] text-white">
                →
              </span>
              Live captain (animated when moving)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-0.5 w-5 border-t-2 border-dashed border-primary" />
              Active ride route
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-500" />
              {stats.activeSos} SOS incidents
            </li>
          </ul>
        </SurfaceCard>

        {ops?.captains.length ? (
          <SurfaceCard padding="sm">
            <h3 className="text-xs font-semibold text-neutral-900">
              Online captains ({ops.captains.length})
            </h3>
            <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto text-xs">
              {ops.captains.map((captain) => (
                <li
                  key={captain.id}
                  className="rounded-lg border border-neutral-100 px-2 py-2"
                >
                  <p className="font-medium text-neutral-800">{captain.name}</p>
                  <p className="text-neutral-500">
                    {captain.vehicleType ?? "Vehicle"} · {captain.plate ?? "—"}
                  </p>
                </li>
              ))}
            </ul>
          </SurfaceCard>
        ) : null}

        {ops?.activeRides.length ? (
          <SurfaceCard padding="sm">
            <h3 className="text-xs font-semibold text-neutral-900">Active trips</h3>
            <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-xs">
              {ops.activeRides.slice(0, 8).map((ride) => (
                <li
                  key={ride.id}
                  className="rounded-lg border border-neutral-100 px-2 py-2"
                >
                  <p className="font-medium text-neutral-800">{ride.riderName}</p>
                  <p className="text-neutral-500">
                    {ride.captainName ?? "Unassigned"} · {ride.status}
                  </p>
                </li>
              ))}
            </ul>
          </SurfaceCard>
        ) : null}
      </div>
      <div className="min-h-[320px] flex-1 p-4 pt-0 lg:p-0">
        <AdminFleetMap
          className="h-full min-h-[400px]"
          captains={ops?.captains ?? []}
          activeRides={ops?.activeRides ?? []}
          overlay={
            <div className="pointer-events-auto rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs font-medium shadow-sm backdrop-blur-sm">
              Live fleet · {ops?.captains.length ?? 0} captains on map ·{" "}
              {stats.activeRides} active rides
            </div>
          }
        />
      </div>
    </div>
  );
}
