"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

import PriorityBadge from "@/components/shared/security/priority-badge";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { Button } from "@/components/ui/button";
import { mapSosAlerts } from "@/lib/security/sos-utils";
import { useActiveSos } from "@/hooks/security/use-sos";

export default function EmergencyResponsePanel() {
  const { data, isLoading, isError } = useActiveSos();
  const active = mapSosAlerts(data ?? []);
  const critical = active.filter((alert) => alert.priority === "critical");

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <SurfaceCard className="flex min-h-120 flex-col">
        <h2 className="text-sm font-semibold text-neutral-900">
          Emergency response
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Active SOS alerts requiring immediate attention.
        </p>
        <div className="dashboard-panel-scroll mt-4 flex-1 space-y-3 rounded-lg border border-neutral-100 p-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="size-4 animate-spin" />
              Loading alerts…
            </div>
          ) : isError ? (
            <p className="text-sm text-red-600">Failed to load SOS alerts.</p>
          ) : active.length === 0 ? (
            <p className="text-sm text-neutral-500">No active SOS alerts.</p>
          ) : (
            active.map((alert) => (
              <div key={alert.id} className="rounded-lg bg-red-50 p-3">
                <p className="text-sm font-medium text-red-800">
                  {alert.riderName} · {alert.triggeredAt}
                </p>
                <p className="mt-1 text-sm text-red-700">
                  {alert.location} · Driver: {alert.driverName}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 border-t border-neutral-100 pt-4">
          <Button className="rounded-lg" asChild>
            <Link href="/security/sos">Open SOS center</Link>
          </Button>
        </div>
      </SurfaceCard>

      <div className="space-y-4">
        <SurfaceCard>
          <h3 className="text-sm font-semibold text-neutral-900">
            Priority queue
          </h3>
          <ul className="mt-3 space-y-2">
            {critical.length === 0 ? (
              <li className="text-sm text-neutral-500">No critical alerts.</li>
            ) : (
              critical.map((alert) => (
                <li
                  key={alert.id}
                  className="rounded-lg border border-red-200 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">{alert.rideId}</span>
                    <PriorityBadge priority={alert.priority} />
                  </div>
                  <p className="mt-1 text-sm text-neutral-700">
                    {alert.location}
                  </p>
                </li>
              ))
            )}
          </ul>
        </SurfaceCard>
      </div>
    </div>
  );
}
