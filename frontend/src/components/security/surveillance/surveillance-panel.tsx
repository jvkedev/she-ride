"use client";

import AdminLiveMap from "@/components/shared/maps/admin-live-map";
import PriorityBadge from "@/components/shared/security/priority-badge";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { monitoredRides } from "@/lib/security/mock-data";

export default function SurveillancePanel() {
  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:p-5">
      <div className="dashboard-panel-scroll space-y-3 overflow-y-auto p-4 lg:p-0">
        <h2 className="text-sm font-semibold text-neutral-900">Monitored rides</h2>
        {monitoredRides.map((ride) => (
          <SurfaceCard key={ride.id} padding="sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-neutral-900">{ride.id}</span>
              <PriorityBadge priority={ride.riskLevel} />
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {ride.riderName} · {ride.driverName}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={ride.status} />
              {ride.deviation ? (
                <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-800">
                  Route deviation
                </span>
              ) : null}
              {ride.suspiciousStop ? (
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                  Suspicious stop
                </span>
              ) : null}
            </div>
          </SurfaceCard>
        ))}
        <SurfaceCard padding="sm">
          <h3 className="text-xs font-semibold text-neutral-900">Ride replay timeline</h3>
          <ol className="mt-3 space-y-2 text-xs text-neutral-600">
            <li>2:35 PM — Pickup confirmed</li>
            <li>2:48 PM — Unplanned stop (4 min)</li>
            <li className="font-medium text-orange-600">2:52 PM — Route deviation detected</li>
            <li>2:55 PM — SOS triggered</li>
          </ol>
        </SurfaceCard>
      </div>
      <div className="min-h-[320px] flex-1 p-4 pt-0 lg:p-0">
        <AdminLiveMap
          className="h-full min-h-[400px]"
          overlay={
            <div className="pointer-events-auto rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs font-medium text-neutral-900 shadow-sm backdrop-blur-sm">
              Live surveillance · {monitoredRides.length} rides monitored
            </div>
          }
        />
      </div>
    </div>
  );
}
