import type { LiveMapMarker } from "@/components/security/maps/live-tracking-map";
import {
  buildSosTrail,
  getSosLatestCoords,
  type SosAlertRecord,
  type SosLocationSnapshot,
} from "@/lib/security/sos-utils";

export type CaptainLiveCoords = {
  latitude: number | null;
  longitude: number | null;
};

export type EnrichedSosAlert = SosAlertRecord & {
  captainLive?: CaptainLiveCoords;
  captain?: SosAlertRecord["captain"];
};

export function getCaptainLiveCoords(
  alert: EnrichedSosAlert,
): { latitude: number; longitude: number } | null {
  const live = alert.captainLive;
  if (
    live?.latitude != null &&
    live?.longitude != null &&
    Number.isFinite(live.latitude) &&
    Number.isFinite(live.longitude)
  ) {
    return { latitude: live.latitude, longitude: live.longitude };
  }
  const captain = alert.ride?.captain as
    | { currentLatitude?: number | null; currentLongitude?: number | null }
    | undefined;
  if (
    captain?.currentLatitude != null &&
    captain?.currentLongitude != null
  ) {
    return {
      latitude: captain.currentLatitude,
      longitude: captain.currentLongitude,
    };
  }
  return null;
}

export function buildSosLiveMarkers(
  alert: EnrichedSosAlert,
  options: {
    selected?: boolean;
    riderTrail?: [number, number][];
    includeRoute?: boolean;
  } = {},
): { markers: LiveMapMarker[]; routeLine?: [number, number][] } {
  const { latitude: riderLat, longitude: riderLng } =
    getSosLatestCoords(alert);
  const captainCoords = getCaptainLiveCoords(alert);
  const captain =
    alert.ride?.captain ?? alert.captain ?? null;
  const ride = alert.ride;

  const markers: LiveMapMarker[] = [
    {
      id: `${alert.id}-rider`,
      latitude: riderLat,
      longitude: riderLng,
      label: `${alert.rider.user.fullName} (Rider)`,
      kind: "rider",
      selected: options.selected,
      trail: options.riderTrail,
    },
  ];

  if (captainCoords && captain) {
    markers.push({
      id: `${alert.id}-captain`,
      latitude: captainCoords.latitude,
      longitude: captainCoords.longitude,
      label: `${captain.user.fullName} (Captain)`,
      kind: "captain",
      vehicleType: (ride as { vehicleType?: string })?.vehicleType ?? null,
    });
  }

  let routeLine: [number, number][] | undefined;
  if (options.includeRoute && ride) {
    const points: [number, number][] = [];
    if (ride.pickupLatitude != null && ride.pickupLongitude != null) {
      markers.push({
        id: `${alert.id}-pickup`,
        latitude: ride.pickupLatitude,
        longitude: ride.pickupLongitude,
        label: "Pickup",
        kind: "pickup",
      });
      points.push([ride.pickupLatitude, ride.pickupLongitude]);
    }
    if (captainCoords) {
      points.push([captainCoords.latitude, captainCoords.longitude]);
    }
    points.push([riderLat, riderLng]);
    if (ride.dropLatitude != null && ride.dropLongitude != null) {
      markers.push({
        id: `${alert.id}-drop`,
        latitude: ride.dropLatitude,
        longitude: ride.dropLongitude,
        label: "Drop",
        kind: "drop",
      });
      points.push([ride.dropLatitude, ride.dropLongitude]);
    }
    routeLine = points;
  }

  return { markers, routeLine };
}

export function buildRiderTrailFromAlert(
  alert: EnrichedSosAlert,
): [number, number][] {
  const { latitude, longitude } = getSosLatestCoords(alert);
  return buildSosTrail(alert.locationSnapshots, { latitude, longitude });
}

export type { SosLocationSnapshot };
