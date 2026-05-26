"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import MapController from "@/components/maps/map-controller";
import MapZoomControls from "@/components/maps/map-zoom-controls";
import {
  connectSocket,
  disconnectSocket,
  sendCaptainLocation,
} from "@/services/socket/socket.service";
import { useCaptainStore } from "@/store/captain.store";

const MarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT: [number, number] = [28.6139, 77.209];

interface LiveMapProps {
  rideId?: string;
}

export default function LiveMap({ rideId }: LiveMapProps) {
  const { activeRideId } = useCaptainStore();
  const [position, setPosition] = useState<[number, number]>(DEFAULT);
  const watchId = useRef<number | null>(null);
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPos = useRef<[number, number]>(DEFAULT);
  const rideIdRef = useRef<string | undefined>(
    rideId ?? activeRideId ?? undefined,
  );
  const userIdRef = useRef<string | null>(null);

  // Keep rideIdRef in sync with both prop and store
  useEffect(() => {
    const effectiveRideId = rideId ?? activeRideId ?? undefined;
    rideIdRef.current = effectiveRideId;
    console.log("rideIdRef updated to:", effectiveRideId);
  }, [rideId, activeRideId]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "CAPTAIN") return;

      userIdRef.current = payload.sub;

      // Connect socket
      connectSocket(payload.sub);

      if (!navigator.geolocation) return;

      // Watch GPS
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords: [number, number] = [
            pos.coords.latitude,
            pos.coords.longitude,
          ];
          setPosition(coords);
          latestPos.current = coords;
        },
        (err) => console.error("GPS error:", err),
        { enableHighAccuracy: true },
      );

      // Send location every 3 seconds
      intervalId.current = setInterval(() => {
        const [lat, lng] = latestPos.current;
        const currentRideId = rideIdRef.current;
        const userId = userIdRef.current;
        console.log("Location tick — rideId:", currentRideId, "pos:", lat, lng);
        if (currentRideId && userId) {
          sendCaptainLocation(currentRideId, userId, lat, lng);
          console.log("Sent location via socket for ride:", currentRideId);
        }
      }, 3000);
      intervalId.current = setInterval(() => {
        const [lat, lng] = latestPos.current;
        const currentRideId = rideIdRef.current;
        const userId = userIdRef.current;

        console.log("Location tick — rideId:", currentRideId, "pos:", lat, lng);

        if (currentRideId && userId) {
          sendCaptainLocation(currentRideId, userId, lat, lng);
          console.log("Sent location via socket for ride:", currentRideId);
        }
      }, 3000);
    } catch {
      return;
    }

    return () => {
      if (watchId.current !== null)
        navigator.geolocation.clearWatch(watchId.current);
      if (intervalId.current !== null) clearInterval(intervalId.current);
      disconnectSocket();
    };
  }, []);

  return (
    <MapContainer
      center={position}
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
      <Marker position={position} icon={MarkerIcon}>
        <Popup>Your location</Popup>
      </Marker>
      <MapController />
      <MapZoomControls />
    </MapContainer>
  );
}
