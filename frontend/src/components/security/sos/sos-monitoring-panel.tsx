"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import AlertCard from "@/components/shared/security/alert-card";
import AdminLiveMap from "@/components/shared/maps/admin-live-map";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { Button } from "@/components/ui/button";
import { mapSosAlerts } from "@/lib/security/sos-utils";
import { useActiveSos, useResolveSos } from "@/hooks/security/use-sos";

export default function SosMonitoringPanel() {
  const { data, isLoading, isError, refetch, isFetching } = useActiveSos();
  const resolveSos = useResolveSos();

  const active = mapSosAlerts(data ?? []);

  async function handleResolve(id: string) {
    try {
      await resolveSos.mutateAsync({
        id,
        status: "RESOLVED",
        resolutionNote: "Resolved from SOS center",
      });
      toast.success("SOS alert resolved");
    } catch {
      toast.error("Failed to resolve SOS alert");
    }
  }

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:p-5">
      <div className="dashboard-panel-scroll space-y-4 overflow-y-auto p-4 lg:p-0">
        <SurfaceCard padding="sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-neutral-900">
              Active SOS alerts
            </h2>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-lg"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
            </Button>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Live alerts from riders and active rides.
          </p>
        </SurfaceCard>

        {isLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-neutral-500">
            <Loader2 className="size-4 animate-spin" />
            Loading SOS alerts…
          </div>
        ) : isError ? (
          <SurfaceCard padding="sm">
            <p className="text-sm text-red-600">Failed to load SOS alerts.</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 rounded-lg"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </SurfaceCard>
        ) : active.length === 0 ? (
          <SurfaceCard padding="sm">
            <p className="text-sm text-neutral-500">No active SOS alerts.</p>
          </SurfaceCard>
        ) : (
          active.map((alert) => (
            <AlertCard
              key={alert.id}
              title={`SOS · ${alert.rideId}`}
              description={`${alert.riderName} · ${alert.driverName} · ${alert.location}`}
              priority={alert.priority}
              time={alert.triggeredAt}
              pulse
              actions={
                <Button
                  size="sm"
                  className="rounded-lg text-xs"
                  disabled={resolveSos.isPending}
                  onClick={() => handleResolve(alert.id)}
                >
                  Resolve
                </Button>
              }
            />
          ))
        )}
      </div>

      <div className="min-h-[320px] flex-1 p-4 pt-0 lg:p-0">
        <AdminLiveMap
          className="h-full min-h-[400px]"
          overlay={
            <div className="pointer-events-auto rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs font-medium text-neutral-900 shadow-sm backdrop-blur-sm">
              Live SOS tracking · {active.length} active
            </div>
          }
        />
      </div>
    </div>
  );
}
