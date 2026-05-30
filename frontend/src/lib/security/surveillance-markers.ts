import type { LiveMapMarker } from "@/components/security/maps/live-tracking-map";

export type LiveActiveRide = {
  id: string;
  status: string;
  riderName: string;
  riderPhone?: string;
  captainName: string | null;
  captainPhone?: string | null;
  captainId?: string | null;
  pickup: string;
  dropoff: string;
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
  captainLat: number | null;
  captainLng: number | null;
  vehicleType?: string | null;
};

export function buildSurveillanceMarkers(
  rides: LiveActiveRide[],
  selectedRideId: string | null,
): { markers: LiveMapMarker[]; routeLine?: [number, number][] } {
  const markers: LiveMapMarker[] = [];
  let routeLine: [number, number][] | undefined;

  for (const ride of rides) {
    const selected = selectedRideId === ride.id;
    const showFull = selected || !selectedRideId;

    if (
      ride.captainLat != null &&
      ride.captainLng != null &&
      Number.isFinite(ride.captainLat)
    ) {
      markers.push({
        id: `${ride.id}-captain`,
        latitude: ride.captainLat,
        longitude: ride.captainLng,
        label: ride.captainName
          ? `${ride.captainName} (Captain)`
          : "Captain",
        kind: "captain",
        selected,
        vehicleType: ride.vehicleType,
      });
    }

    if (showFull && selected) {
      markers.push(
        {
          id: `${ride.id}-pickup`,
          latitude: ride.pickupLat,
          longitude: ride.pickupLng,
          label: "Pickup",
          kind: "pickup",
        },
        {
          id: `${ride.id}-drop`,
          latitude: ride.dropLat,
          longitude: ride.dropLng,
          label: "Drop",
          kind: "drop",
        },
      );

      routeLine = [
        [ride.pickupLat, ride.pickupLng],
        ...(ride.captainLat != null && ride.captainLng != null
          ? ([[ride.captainLat, ride.captainLng]] as [number, number][])
          : []),
        [ride.dropLat, ride.dropLng],
      ];
    }
  }

  return { markers, routeLine };
}
