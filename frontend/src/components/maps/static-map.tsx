"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import MapController from "@/components/maps/map-controller";
import MapZoomControls from "@/components/maps/map-zoom-controls";

const DEFAULT: [number, number] = [28.6139, 77.209];

function createRiderIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:18px;height:18px;
      background:#ec4899;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function createPickupIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:18px;height:18px;
      background:#2563eb;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function createDropIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:18px;height:18px;
      background:#10b981;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function MapPanner({
  position,
  hasRealGps,
  active,
}: {
  position: [number, number];
  hasRealGps: boolean;
  active: boolean;
}) {
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    if (!hasRealGps || !active) return;
    if (!Number.isFinite(position[0]) || !Number.isFinite(position[1])) return;

    if (!hasFlown.current) {
      const t = setTimeout(() => {
        map.setView(position, 15, { animate: false });
        hasFlown.current = true;
      }, 300);
      return () => clearTimeout(t);
    }

    map.panTo(position, { animate: true, duration: 0.5 });
  }, [position, hasRealGps, active, map]);

  return null;
}

interface StaticMapProps {
  pickup?: [number, number];
  drop?: [number, number];
  route?: [number, number][];
  nearbyCaptains?: number;
}

export default function StaticMap({
  pickup,
  drop,
  route = [],
  nearbyCaptains,
}: StaticMapProps) {
  const [position, setPosition] = useState<[number, number]>(DEFAULT);
  const [hasRealGps, setHasRealGps] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const watchId = useRef<number | null>(null);
  const riderIcon = useRef(createRiderIcon());
  const pickupIcon = useRef(createPickupIcon());
  const dropIcon = useRef(createDropIcon());

  useEffect(() => {
    if (!navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude);
        const lng = Number(pos.coords.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        setPosition([lat, lng]);
        setHasRealGps(true);
      },
      (err) => console.error("GPS error:", err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 },
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    if (pickup && drop) {
      const bounds = L.latLngBounds([pickup, drop]);
      map.fitBounds(bounds, { padding: [50, 50] });
      return;
    }

    if (hasRealGps) {
      map.setView(position, 15, { animate: false });
    }
  }, [map, pickup, drop, position, hasRealGps]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={DEFAULT}
        zoom={13}
        className="h-full w-full rounded-2xl"
        style={{ height: "100%", width: "100%", minHeight: 320 }}
        dragging
        touchZoom
        scrollWheelZoom
        doubleClickZoom
        zoomControl={false}      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {route.length > 1 && (
          <Polyline
            positions={route}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
          />
        )}

        {pickup && (
          <Marker position={pickup} icon={pickupIcon.current}>
            <Popup>Pickup</Popup>
          </Marker>
        )}

        {drop && (
          <Marker position={drop} icon={dropIcon.current}>
            <Popup>Drop-off</Popup>
          </Marker>
        )}

        {hasRealGps && (
          <Marker position={position} icon={riderIcon.current}>
            <Popup>Your location</Popup>
          </Marker>
        )}

        <MapPanner
          position={position}
          hasRealGps={hasRealGps}
          active={!pickup || !drop}
        />
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
    </div>
  );
}
