"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

import AdminLiveMap from "@/components/shared/maps/admin-live-map";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { fetchLiveOperations } from "@/services/security/security-profile.service";

export default function SurveillancePanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeRides, setActiveRides] = useState<
    Array<{
      id: string;
      status: string;
      riderName: string;
      captainName: string | null;
      pickup: string;
      dropoff: string;
    }>
  >([]);

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
    const interval = setInterval(load, 20_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:p-5">
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
            <SurfaceCard key={ride.id} padding="sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-neutral-900">
                  {ride.id.slice(0, 8)}
                </span>
                <StatusBadge status={ride.status} />
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {ride.riderName}
                {ride.captainName ? ` · ${ride.captainName}` : ""}
              </p>
              <p className="mt-2 text-xs text-neutral-600">{ride.pickup}</p>
              <p className="text-xs text-neutral-500">→ {ride.dropoff}</p>
            </SurfaceCard>
          ))
        )}
      </div>

      <div className="min-h-[320px] flex-1 p-4 pt-0 lg:p-0">
        <AdminLiveMap
          className="h-full min-h-[400px]"
          overlay={
            <div className="pointer-events-auto rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs font-medium text-neutral-900 shadow-sm backdrop-blur-sm">
              Live surveillance · {activeRides.length} active rides
            </div>
          }
        />
      </div>
    </div>
  );
}
