"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, useMemo } from "react";
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
import { getCurrentLocation } from "@/lib/maps/geolocation";

const DEFAULT: [number, number] = [28.6139, 77.209];

function createRiderIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;background:#ec4899;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

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
  const [position, setPosition] = useState<[number, number]>(DEFAULT);
  const [hasRealGps, setHasRealGps] = useState(false);
  const gpsRequestRef = useRef(0);
  const riderIcon = useRef(createRiderIcon());
  const pickupIcon = useRef(createPickupIcon());
  const dropIcon = useRef(createDropIcon());

  const validPickup = normalizeLatLng(pickup) ?? undefined;
  const validDrop = normalizeLatLng(drop) ?? undefined;

  const cameraPoints = useMemo(
    () => filterValidLatLngs([validPickup, validDrop].filter(Boolean)),
    [validPickup, validDrop],
  );

  const gpsPoint = useMemo(() => normalizeLatLng(position), [position]);

  const cameraMode: MapCameraMode = useMemo(() => {
    if (validPickup && validDrop) return "pickup-drop-preview";
    if (validPickup || validDrop) return "single";
    return "single";
  }, [validPickup, validDrop]);

  const safeRoute = useMemo(() => filterValidLatLngs(route), [route]);

  const cameraKey = useMemo(
    () =>
      `${validPickup?.join(",") ?? ""}|${validDrop?.join(",") ?? ""}|${gpsPoint?.join(",") ?? ""}|${safeRoute.length}`,
    [validPickup, validDrop, gpsPoint, safeRoute.length],
  );

  useEffect(() => {
    if (validPickup) {
      setHasRealGps(false);
      return;
    }

    const requestId = ++gpsRequestRef.current;
    let cancelled = false;

    getCurrentLocation({
      overallTimeoutMs: 30000,
      mode: "balanced",
    })
      .then((coords) => {
        if (cancelled || requestId !== gpsRequestRef.current) return;
        const pt = normalizeLatLng([coords.latitude, coords.longitude]);
        if (!pt) return;
        setPosition(pt);
        setHasRealGps(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [validPickup]);

  const showRiderDot =
    hasRealGps &&
    gpsPoint != null &&
    (!validPickup ||
      Math.abs(gpsPoint[0] - validPickup[0]) > 0.0003 ||
      Math.abs(gpsPoint[1] - validPickup[1]) > 0.0003);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={validPickup ?? DEFAULT}
        zoom={validPickup ? 16 : 13}
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
          <Marker position={validPickup} icon={pickupIcon.current}>
            <Popup>Pickup</Popup>
          </Marker>
        )}

        {validDrop && (
          <Marker position={validDrop} icon={dropIcon.current}>
            <Popup>Drop-off</Popup>
          </Marker>
        )}

        {showRiderDot && gpsPoint && (
          <Marker position={gpsPoint} icon={riderIcon.current}>
            <Popup>Your location</Popup>
          </Marker>
        )}

        {(cameraPoints.length > 0 ||
          (hasRealGps && gpsPoint != null && !validPickup)) && (
          <MapBoundsFitter
            points={
              cameraPoints.length > 0
                ? cameraPoints
                : gpsPoint
                  ? [gpsPoint]
                  : []
            }
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
        <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white bg-white/90 px-3 py-2 text-xs font-semibold text-neutral-900 shadow-md">
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
