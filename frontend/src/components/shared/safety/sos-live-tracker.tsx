"use client";

import { useEffect, useMemo, useState } from "react";
import { Car, Loader2, MapPin, Radio } from "lucide-react";

import LiveTrackingMap from "@/components/security/maps/live-tracking-map";
import SosContactCard from "@/components/security/sos/sos-contact-card";
import { buildSosContactInfo } from "@/lib/security/sos-contact-info";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { getStoredUser } from "@/lib/auth/session";
import { subscribeLiveLocation } from "@/lib/maps/geolocation";
import {
  buildRiderTrailFromAlert,
  buildSosLiveMarkers,
  type EnrichedSosAlert,
} from "@/lib/security/sos-live-markers";
import {
  connectSocket,
  joinSosRoom,
  subscribeSosEvents,
} from "@/services/socket/socket.service";
import {
  stopSosLocationStream,
  startSosLocationStream,
} from "@/services/security/sos-trigger.service";
import { sosApi } from "@/services/security/security-api";

const ACTIVE_SOS_KEY = "she-ride:active-sos-id";

type SosLiveTrackerProps = {
  sosAlertId: string;
  onResolved?: () => void;
  className?: string;
};

export function getStoredActiveSosId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ACTIVE_SOS_KEY);
}

export function storeActiveSosId(id: string) {
  sessionStorage.setItem(ACTIVE_SOS_KEY, id);
}

export function clearStoredActiveSosId() {
  sessionStorage.removeItem(ACTIVE_SOS_KEY);
}

export default function SosLiveTracker({
  sosAlertId,
  onResolved,
  className,
}: SosLiveTrackerProps) {
  const [alert, setAlert] = useState<EnrichedSosAlert | null>(null);
  const [selfPosition, setSelfPosition] = useState<[number, number] | null>(
    null,
  );
  const [resolved, setResolved] = useState(false);
  const user = getStoredUser();
  const isCaptain = user?.role === "CAPTAIN";

  useEffect(() => {
    storeActiveSosId(sosAlertId);
    startSosLocationStream(sosAlertId);

    if (user?.id) {
      connectSocket(user.id, { role: user.role });
      joinSosRoom(sosAlertId);
    }

    async function loadAlert() {
      try {
        const data = (await sosApi.getMyActive()) as EnrichedSosAlert | null;
        if (data?.id === sosAlertId) setAlert(data);
      } catch {
        /* ignore */
      }
    }

    void loadAlert();
    const poll = setInterval(loadAlert, 4_000);

    const stopGps = subscribeLiveLocation((coords) => {
      setSelfPosition([coords.latitude, coords.longitude]);
    });

    const unsub = subscribeSosEvents({
      onLocation: (payload) => {
        if (payload.sosAlertId !== sosAlertId) return;
        setAlert((prev) => {
          if (!prev) return prev;
          if (payload.role === "CAPTAIN") {
            return {
              ...prev,
              captainLive: {
                latitude: payload.latitude,
                longitude: payload.longitude,
              },
            };
          }
          const snapshots = [...(prev.locationSnapshots ?? [])];
          snapshots.push({
            latitude: payload.latitude,
            longitude: payload.longitude,
            capturedAt: payload.capturedAt,
          });
          return {
            ...prev,
            latitude: payload.latitude,
            longitude: payload.longitude,
            locationSnapshots: snapshots,
          };
        });
      },
      onResolved: (payload) => {
        if (payload.sosAlertId !== sosAlertId) return;
        setResolved(true);
        stopSosLocationStream(sosAlertId);
        clearStoredActiveSosId();
        onResolved?.();
      },
    });

    return () => {
      clearInterval(poll);
      stopGps();
      unsub();
    };
  }, [sosAlertId, onResolved, user?.id, user?.role]);

  const liveAlert = useMemo(() => {
    if (!alert) return null;
    if (!selfPosition) return alert;

    if (isCaptain) {
      return {
        ...alert,
        captainLive: {
          latitude: selfPosition[0],
          longitude: selfPosition[1],
        },
      };
    }

    return {
      ...alert,
      latitude: selfPosition[0],
      longitude: selfPosition[1],
      locationSnapshots: [
        ...(alert.locationSnapshots ?? []),
        {
          latitude: selfPosition[0],
          longitude: selfPosition[1],
          capturedAt: new Date().toISOString(),
        },
      ],
    };
  }, [alert, selfPosition, isCaptain]);

  const { markers, routeLine } = useMemo(() => {
    if (!liveAlert) return { markers: [], routeLine: undefined };
    return buildSosLiveMarkers(liveAlert, {
      selected: true,
      riderTrail: buildRiderTrailFromAlert(liveAlert),
      includeRoute: true,
    });
  }, [liveAlert]);

  if (resolved) {
    return (
      <SurfaceCard padding="sm" className={className}>
        <p className="text-sm font-medium text-emerald-700">
          Your SOS alert has been resolved by support.
        </p>
      </SurfaceCard>
    );
  }

  const ride = alert?.ride;
  const contacts = buildSosContactInfo(alert ?? undefined);

  return (
    <div className={className}>
      <SurfaceCard padding="sm" className="mb-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
          <Radio className="h-4 w-4 animate-pulse" />
          SOS active — sharing live location
        </div>
        <p className="text-xs text-neutral-600">
          Security can see both rider and captain on the map. Keep this screen
          open while help is on the way.
        </p>

        {ride?.status && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Ride</span>
            <StatusBadge status={ride.status.toLowerCase()} />
          </div>
        )}

        {contacts && (
          <div className="grid gap-2 sm:grid-cols-2">
            <SosContactCard
              label="Rider"
              name={contacts.riderName}
              phone={contacts.riderPhone}
              photo={contacts.riderPhoto}
              rating={contacts.riderRating}
            />
            <SosContactCard
              label="Captain"
              name={contacts.driverName}
              phone={contacts.driverPhone}
              photo={contacts.driverPhoto}
              rating={contacts.driverRating}
            />
          </div>
        )}

        {ride?.pickupAddress && (
          <p className="flex items-start gap-1 text-xs text-neutral-600">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            {ride.pickupAddress} → {ride.dropAddress}
          </p>
        )}

        {ride?.captain && (
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <Car className="h-3 w-3" />
            Captain vehicle on map updates live during the ride
          </p>
        )}
      </SurfaceCard>

      {!selfPosition || markers.length === 0 ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Acquiring GPS & ride data…
        </div>
      ) : (
        <LiveTrackingMap
          className="min-h-72"
          markers={markers}
          routeLine={routeLine}
          followSelected
          overlay={
            <div className="rounded-lg border border-red-200 bg-red-50/95 px-3 py-2 text-xs font-medium text-red-800 shadow-sm backdrop-blur-sm">
              Live: you + {isCaptain ? "rider" : "captain"} on map
            </div>
          }
        />
      )}
    </div>
  );
}
