"use client";

import AdminLiveMap from "@/components/shared/maps/admin-live-map";
import PriorityBadge from "@/components/shared/security/priority-badge";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { Button } from "@/components/ui/button";
import { riskZones } from "@/lib/security/mock-data";

export default function RiskZonesPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SurfaceCard>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Geo-fenced zones</h2>
          <Button size="sm" className="rounded-lg">
            Add zone
          </Button>
        </div>
        <ul className="mt-4 space-y-3">
          {riskZones.map((zone) => (
            <li key={zone.id} className="rounded-lg border border-neutral-100 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-neutral-900">{zone.name}</p>
                  <p className="text-xs text-neutral-500">{zone.activeHours}</p>
                </div>
                <PriorityBadge priority={zone.level} />
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                {zone.incidents} incidents (30d)
              </p>
            </li>
          ))}
        </ul>
      </SurfaceCard>
      <div className="min-h-[360px]">
        <AdminLiveMap
          className="h-full min-h-[360px]"
          overlay={
            <span className="rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs text-neutral-900 shadow-sm backdrop-blur-sm">
              Risk heatmap overlay · OpenStreetMap
            </span>
          }
        />
      </div>
    </div>
  );
}
