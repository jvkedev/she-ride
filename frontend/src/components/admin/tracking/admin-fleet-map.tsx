"use client";

import "leaflet/dist/leaflet.css";
import "@/styles/fleet-markers.css";

import { useMemo } from "react";
import { MapContainer, Polyline, TileLayer } from "react-leaflet";

import FleetCaptainMarker, {
  type FleetCaptain,
} from "@/components/admin/tracking/fleet-captain-marker";
import MapBoundsFitter from "@/components/maps/map-bounds-fitter";
import MapController from "@/components/maps/map-controller";
import MapZoomControls from "@/components/maps/map-zoom-controls";
import { filterValidLatLngs } from "@/lib/maps/map-camera";
import { MAP_INDIA_OVERVIEW_CENTER } from "@/lib/maps/map-defaults";
import { cn } from "@/lib/utils";

const DEFAULT: [number, number] = MAP_INDIA_OVERVIEW_CENTER;

type ActiveRideRoute = {
  id: string;
  pickupLat: number | null;
  pickupLng: number | null;
  dropLat: number | null;
  dropLng: number | null;
  status: string;
};

type AdminFleetMapProps = {
  captains: FleetCaptain[];
  activeRides?: ActiveRideRoute[];
  className?: string;
  overlay?: React.ReactNode;
};

export default function AdminFleetMap({
  captains,
  activeRides = [],
  className,
  overlay,
}: AdminFleetMapProps) {
  const captainPoints = useMemo(
    () =>
      filterValidLatLngs(
        captains.map((c) => [c.lat, c.lng] as [number, number]),
      ),
    [captains],
  );

  const rideRoutes = useMemo(
    () =>
      activeRides
        .map((ride) => {
          if (
            ride.pickupLat == null ||
            ride.pickupLng == null ||
            ride.dropLat == null ||
            ride.dropLng == null
          ) {
            return null;
          }
          return {
            id: ride.id,
            points: [
              [ride.pickupLat, ride.pickupLng],
              [ride.dropLat, ride.dropLng],
            ] as [number, number][],
          };
        })
        .filter(Boolean) as Array<{ id: string; points: [number, number][] }>,
    [activeRides],
  );

  const fitPoints = useMemo(() => {
    const ridePts = rideRoutes.flatMap((r) => r.points);
    return filterValidLatLngs([...captainPoints, ...ridePts]);
  }, [captainPoints, rideRoutes]);

  const mapCenter = captainPoints[0] ?? DEFAULT;

  return (
    <div
      className={cn(
        "relative h-full min-h-80 w-full overflow-hidden rounded-2xl",
        className,
      )}
    >
      <MapContainer
        center={mapCenter}
        zoom={12}
        className="h-full w-full rounded-2xl"
        style={{ height: "100%", width: "100%", minHeight: 320 }}
        dragging
        touchZoom
        scrollWheelZoom
        doubleClickZoom
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {rideRoutes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.points}
            color="#ff2e6d"
            weight={4}
            opacity={0.55}
            dashArray="8 10"
          />
        ))}

        {captains.map((captain) => (
          <FleetCaptainMarker key={captain.id} captain={captain} />
        ))}

        {fitPoints.length > 0 && (
          <MapBoundsFitter
            points={fitPoints}
            mode={fitPoints.length === 1 ? "single" : "pickup-drop-preview"}
            cameraKey={`${fitPoints.length}-${captains.length}`}
            padding={[72, 72]}
          />
        )}

        <MapController />
        <MapZoomControls />
      </MapContainer>

      {overlay ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-3">
          {overlay}
        </div>
      ) : null}

      {captains.length === 0 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] p-3">
          <div className="rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-center text-xs text-neutral-500 shadow-sm backdrop-blur-sm">
            No captain GPS online right now. Markers appear when captains go online and share location.
          </div>
        </div>
      ) : null}
    </div>
  );
}
