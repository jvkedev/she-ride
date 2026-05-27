"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import MapController from "@/components/maps/map-controller";
import MapZoomControls from "@/components/maps/map-zoom-controls";
import {
  connectSocket,
  disconnectSocket,
  sendCaptainLocation,
} from "@/services/socket/socket.service";
import { useCaptainStore } from "@/store/captain.store";

const DEFAULT: [number, number] = [28.6139, 77.209];

// Vehicle emoji icons
function createVehicleIcon(vehicleType?: string) {
  const emoji =
    vehicleType === "BIKE"
      ? "🏍️"
      : vehicleType === "AUTO"
        ? "🛺"
        : vehicleType === "SUV"
          ? "🚙"
          : "🚗"; // CAR default

  return L.divIcon({
    className: "",
    html: `<div style="
      font-size:28px;
      line-height:1;
      filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      user-select:none;
    ">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// Rider pink dot icon
function createRiderIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:16px;height:16px;
      background:#ec4899;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

// Pans map only when real GPS arrives — no flyTo with DEFAULT coords
function MapPanner({
  position,
  hasRealGps,
}: {
  position: [number, number];
  hasRealGps: boolean;
}) {
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    if (!hasRealGps) return;
    if (!Number.isFinite(position[0]) || !Number.isFinite(position[1])) return;

    if (!hasFlown.current) {
      const t = setTimeout(() => {
        map.setView(position, 15, { animate: false });
        hasFlown.current = true;
      }, 300);
      return () => clearTimeout(t);
    }

    map.panTo(position, { animate: true, duration: 0.5 });
  }, [position, hasRealGps, map]);

  return null;
}

interface LiveMapProps {
  rideId?: string;
  vehicleType?: string; // passed from captain dashboard
}

export default function LiveMap({ rideId, vehicleType }: LiveMapProps) {
  const { activeRideId } = useCaptainStore();

  const [position, setPosition] = useState<[number, number]>(DEFAULT);
  const [hasRealGps, setHasRealGps] = useState(false);

  const watchId = useRef<number | null>(null);
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPos = useRef<[number, number]>(DEFAULT);
  const rideIdRef = useRef<string | undefined>(rideId ?? activeRideId ?? undefined);
  const userIdRef = useRef<string | null>(null);

  const captainIcon = useRef(createVehicleIcon(vehicleType));
  const riderIcon = useRef(createRiderIcon());

  // Keep rideIdRef in sync
  useEffect(() => {
    rideIdRef.current = rideId ?? activeRideId ?? undefined;
  }, [rideId, activeRideId]);

  // Update captain icon when vehicleType changes
  useEffect(() => {
    captainIcon.current = createVehicleIcon(vehicleType);
  }, [vehicleType]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    let payload: { role: string; sub: string } | null = null;

    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch {
      return;
    }

    if (!payload || payload.role !== "CAPTAIN") return;

    userIdRef.current = payload.sub;
    connectSocket(payload.sub);

    if (!navigator.geolocation) return;

    // Watch GPS every 3 seconds (maximumAge: 3000)
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude);
        const lng = Number(pos.coords.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        const coords: [number, number] = [lat, lng];
        setPosition(coords);
        setHasRealGps(true);
        latestPos.current = coords;
      },
      (err) => console.error("GPS error:", err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 },
    );

    // Emit location via socket every 3 seconds
    intervalId.current = setInterval(() => {
      const [lat, lng] = latestPos.current;
      const currentRideId = rideIdRef.current;
      const userId = userIdRef.current;

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      if (currentRideId && userId) {
        sendCaptainLocation(currentRideId, userId, lat, lng);
      }
    }, 3000);

    return () => {
      if (watchId.current !== null)
        navigator.geolocation.clearWatch(watchId.current);
      if (intervalId.current !== null) clearInterval(intervalId.current);
      disconnectSocket();
    };
  }, []);

  return (
    <MapContainer
      center={DEFAULT}
      zoom={15}
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

      {/* Captain marker — vehicle emoji */}
      {hasRealGps && (
        <Marker position={position} icon={captainIcon.current}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      <MapPanner position={position} hasRealGps={hasRealGps} />
      <MapController />
      <MapZoomControls />
    </MapContainer>
  );
}
