"use client";

import AdminLiveMap from "@/components/shared/maps/admin-live-map";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatWidget from "@/components/shared/dashboard/stat-widget";
import { Car, MapPin, Users } from "lucide-react";
import { adminOverviewStats } from "@/lib/admin/mock-data";

export default function LiveTrackingPanel() {
  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:p-5">
      <div className="dashboard-panel-scroll space-y-3 overflow-y-auto p-4 lg:p-0">
        <StatWidget
          label="Active rides"
          value={String(adminOverviewStats.activeRides)}
          icon={MapPin}
          accent="primary"
        />
        <StatWidget
          label="Online drivers"
          value={String(adminOverviewStats.onlineDrivers)}
          icon={Car}
        />
        <StatWidget
          label="Riders on trip"
          value="128"
          icon={Users}
        />
        <SurfaceCard padding="sm">
          <h3 className="text-xs font-semibold text-neutral-900">Live markers</h3>
          <ul className="mt-3 space-y-2 text-xs text-neutral-600">
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              Active ride routes
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              Online captains
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-500" />
              SOS incidents
            </li>
          </ul>
        </SurfaceCard>
      </div>
      <div className="min-h-[320px] flex-1 p-4 pt-0 lg:p-0">
        <AdminLiveMap
          className="h-full min-h-[400px]"
          overlay={
            <div className="pointer-events-auto rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs font-medium shadow-sm backdrop-blur-sm">
              Live fleet · Delhi NCR · {adminOverviewStats.activeRides} active rides
            </div>
          }
        />
      </div>
    </div>
  );
}
