"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Car,
  Loader2,
  MapPin,
  Radio,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import LiveTrackingMap from "@/components/security/maps/live-tracking-map";
import SosContactCard from "@/components/security/sos/sos-contact-card";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import PriorityBadge from "@/components/shared/security/priority-badge";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  buildRiderTrailFromAlert,
  buildSosLiveMarkers,
  type EnrichedSosAlert,
} from "@/lib/security/sos-live-markers";
import { buildSosContactInfo } from "@/lib/security/sos-contact-info";
import { type SosAlertRecord } from "@/lib/security/sos-utils";
import { cn } from "@/lib/utils";
import { useSosLiveUpdates } from "@/hooks/security/use-sos-live";
import { useActiveSos, useResolveSos, useSosAlert } from "@/hooks/security/use-sos";

export default function SosMonitoringPanel() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch, isFetching } = useActiveSos();
  const { data: selectedDetail, isFetching: detailFetching } = useSosAlert(
    selectedId ?? "",
  );
  const resolveSos = useResolveSos();

  useSosLiveUpdates(selectedId);

  const active = useMemo(
    () =>
      ((data ?? []) as SosAlertRecord[])
        .map((alert) => buildSosContactInfo(alert))
        .filter((alert): alert is NonNullable<typeof alert> => alert != null),
    [data],
  );

  useEffect(() => {
    if (active.length === 1 && !selectedId) {
      setSelectedId(active[0].id);
    }
  }, [active, selectedId]);

  const selectedSummary = active.find((a) => a.id === selectedId) ?? null;

  const contactInfo = useMemo(() => {
    const source =
      (selectedDetail as SosAlertRecord | undefined) ??
      ((data ?? []) as SosAlertRecord[]).find((a) => a.id === selectedId);
    return buildSosContactInfo(source);
  }, [selectedDetail, data, selectedId]);

  const { markers: mapMarkers, routeLine } = useMemo(() => {
    if (selectedId && selectedDetail) {
      const alert = selectedDetail as EnrichedSosAlert;
      const riderTrail = buildRiderTrailFromAlert(alert);
      return buildSosLiveMarkers(alert, {
        selected: true,
        riderTrail,
        includeRoute: true,
      });
    }

    return {
      markers: active.map((alert) => ({
        id: alert.id,
        latitude: alert.latitude,
        longitude: alert.longitude,
        label: alert.riderName,
        kind: "rider" as const,
        selected: false,
      })),
      routeLine: undefined,
    };
  }, [selectedId, selectedDetail, active]);

  async function handleResolve(id: string) {
    try {
      await resolveSos.mutateAsync({
        id,
        status: "RESOLVED",
        resolutionNote: "Resolved from SOS center",
      });
      if (selectedId === id) setSelectedId(null);
      toast.success("SOS alert resolved");
    } catch {
      toast.error("Failed to resolve SOS alert");
    }
  }

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,320px)_1fr] lg:p-5">
      <div className="dashboard-panel-scroll space-y-3 overflow-y-auto p-4 lg:p-0">
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
            Select an alert to see ride details and live rider + captain
            locations.
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
            <button
              key={alert.id}
              type="button"
              onClick={() => setSelectedId(alert.id)}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition",
                selectedId === alert.id
                  ? "border-red-300 bg-red-50/80 ring-2 ring-red-200"
                  : "border-neutral-200 bg-white hover:border-red-200 hover:bg-red-50/40",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900">
                      {alert.riderName}
                    </span>
                    <PriorityBadge priority={alert.priority} />
                  </div>
                  {alert.driverName !== "—" &&
                    alert.driverName !== "No captain linked" && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-neutral-600">
                      <Car className="h-3 w-3" />
                      Captain: {alert.driverName}
                    </p>
                  )}
                  <p className="mt-1 flex items-start gap-1 text-xs text-neutral-600">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                    {alert.location}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {alert.triggeredAt}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}

        {contactInfo && (
          <SurfaceCard padding="sm" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-neutral-900">
                Ride & contacts
              </h3>
              {detailFetching && (
                <Loader2 className="size-3.5 animate-spin text-neutral-400" />
              )}
            </div>

            {contactInfo.rideStatus && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">Ride status</span>
                <StatusBadge status={contactInfo.rideStatus} />
              </div>
            )}

            <SosContactCard
              label="Rider"
              name={contactInfo.riderName}
              phone={contactInfo.riderPhone}
              photo={contactInfo.riderPhoto}
              rating={contactInfo.riderRating}
            />

            <SosContactCard
              label="Captain"
              name={contactInfo.driverName}
              phone={contactInfo.driverPhone}
              photo={contactInfo.driverPhoto}
              rating={contactInfo.driverRating}
            />

            {contactInfo.pickupAddress && (
              <div className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3 text-xs text-neutral-600">
                <p className="font-medium text-neutral-500">Route</p>
                <p className="mt-1">{contactInfo.pickupAddress}</p>
                <p className="text-neutral-400">↓</p>
                <p>{contactInfo.dropAddress ?? "—"}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="h-8 rounded-lg text-xs"
                disabled={resolveSos.isPending}
                onClick={() => void handleResolve(contactInfo.id)}
              >
                Resolve
              </Button>
            </div>
          </SurfaceCard>
        )}
      </div>

      <div className="flex min-h-[320px] flex-1 flex-col gap-3 p-4 pt-0 lg:p-0">
        <LiveTrackingMap
          className="min-h-[400px] flex-1"
          markers={mapMarkers}
          routeLine={routeLine}
          followSelected={Boolean(selectedSummary)}
          overlay={
            <div className="rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs font-medium text-neutral-900 shadow-sm backdrop-blur-sm">
              {selectedSummary ? (
                <span className="inline-flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 animate-pulse text-red-500" />
                  Live: {selectedSummary.riderName}
                  {contactInfo?.driverName &&
                  contactInfo.driverName !== "No captain linked" &&
                  contactInfo.driverName !== "—"
                    ? ` & ${contactInfo.driverName}`
                    : ""}
                </span>
              ) : (
                <span>
                  {active.length > 0
                    ? `${active.length} SOS alert${active.length > 1 ? "s" : ""} — select to see rider + captain`
                    : "No active SOS alerts on map"}
                </span>
              )}
            </div>
          }
        />

        {selectedSummary && (
          <div className="flex flex-wrap justify-center gap-4 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-pink-500" />
              Rider live GPS
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-base leading-none">🚗</span>
              Captain live GPS
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
        )}
      </div>
    </div>
  );
}
