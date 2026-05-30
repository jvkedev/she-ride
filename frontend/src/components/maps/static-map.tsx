"use client";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";
import MapController from "@/components/maps/map-controller";
import MapZoomControls from "@/components/maps/map-zoom-controls";
import MapBoundsFitter from "@/components/maps/map-bounds-fitter";
import RoutePolyline from "@/components/maps/route-polyline";
import {
  filterValidLatLngs,
  normalizeLatLng,
  type MapCameraMode,
} from "@/lib/maps/map-camera";
import {
  MAP_INDIA_OVERVIEW_CENTER,
  MAP_INDIA_OVERVIEW_ZOOM,
  MAP_LOCATION_ZOOM,
} from "@/lib/maps/map-defaults";

function createPickupIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function createDropIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;background:#10b981;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

interface StaticMapProps {
  pickup?: [number, number];
  drop?: [number, number];
  route?: [number, number][];
  routeIsPreview?: boolean;
  nearbyCaptains?: number;
  routeDistanceKm?: number;
  routeDurationMin?: number;
}

export default function StaticMap({
  pickup,
  drop,
  route = [],
  routeIsPreview = false,
  nearbyCaptains,
  routeDistanceKm,
  routeDurationMin,
}: StaticMapProps) {
  const pickupIcon = useMemo(() => createPickupIcon(), []);
  const dropIcon = useMemo(() => createDropIcon(), []);

  const validPickup = normalizeLatLng(pickup) ?? undefined;
  const validDrop = normalizeLatLng(drop) ?? undefined;

  const cameraPoints = useMemo(
    () => filterValidLatLngs([validPickup, validDrop].filter(Boolean)),
    [validPickup, validDrop],
  );

  const cameraMode: MapCameraMode = useMemo(() => {
    if (validPickup && validDrop) return "pickup-drop-preview";
    if (validPickup || validDrop) return "single";
    return "single";
  }, [validPickup, validDrop]);

  const safeRoute = useMemo(() => filterValidLatLngs(route), [route]);

  const cameraKey = useMemo(
    () =>
      `${validPickup?.join(",") ?? ""}|${validDrop?.join(",") ?? ""}|${safeRoute.length}`,
    [validPickup, validDrop, safeRoute.length],
  );

  const mapCenter = validPickup ?? validDrop ?? MAP_INDIA_OVERVIEW_CENTER;
  const mapZoom =
    validPickup || validDrop ? MAP_LOCATION_ZOOM : MAP_INDIA_OVERVIEW_ZOOM;

  return (
    <div className="relative h-full w-full">
      {!validPickup && !validDrop && (
        <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white bg-white/90 px-3 py-2 text-xs font-medium text-neutral-700 shadow-md">
          Tap &quot;Use current location&quot; to set pickup on the map
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
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

        <RoutePolyline
          positions={safeRoute}
          variant={routeIsPreview ? "preview" : "primary"}
        />

        {validPickup && (
          <Marker position={validPickup} icon={pickupIcon}>
            <Popup>Pickup</Popup>
          </Marker>
        )}

        {validDrop && (
          <Marker position={validDrop} icon={dropIcon}>
            <Popup>Drop-off</Popup>
          </Marker>
        )}

        {cameraPoints.length > 0 && (
          <MapBoundsFitter
            points={cameraPoints}
            route={safeRoute}
            mode={cameraMode}
            cameraKey={cameraKey}
            padding={[80, 80]}
          />
        )}

        <MapController />
        <MapZoomControls />
      </MapContainer>

      {typeof nearbyCaptains === "number" && (
        <div className="pointer-events-none absolute left-4 bottom-4 z-20 rounded-full border border-white bg-white/90 px-3 py-2 text-xs font-semibold text-neutral-900 shadow-md lg:top-4 lg:bottom-auto">
          {nearbyCaptains > 0
            ? `${nearbyCaptains} captains nearby`
            : "No captains nearby"}
        </div>
      )}

      {routeDistanceKm != null && routeDistanceKm > 0 && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white bg-white/95 px-4 py-2 text-xs font-semibold text-neutral-800 shadow-md">
          {routeDistanceKm.toFixed(1)} km
          {routeDurationMin != null && routeDurationMin > 0
            ? ` · ~${routeDurationMin} min`
            : ""}
        </div>
      )}
    </div>
  );
}
