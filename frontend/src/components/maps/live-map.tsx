"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import MapController from "@/components/maps/map-controller";
import MapZoomControls from "@/components/maps/map-zoom-controls";
import { updateLocation } from "@/services/captain/captain-rides.service";

const MarkerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT: [number, number] = [28.6139, 77.209];

export default function LiveMap() {
  const [position, setPosition] = useState<[number, number]>(DEFAULT);
  const watchId = useRef<number | null>(null);
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPos = useRef<[number, number]>(DEFAULT);

  useEffect(() => {
    // Guard — only captains should send location
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "CAPTAIN") return;
    } catch {
      return;
    }

    if (!navigator.geolocation) return;

    // Watch GPS position
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

    // Send location to backend every 5 seconds
    intervalId.current = setInterval(async () => {
      const [lat, lng] = latestPos.current;
      try {
        await updateLocation(lat, lng);
      } catch (err) {
        console.error("Failed to update location:", err);
      }
    }, 5000);

    return () => {
      if (watchId.current !== null)
        navigator.geolocation.clearWatch(watchId.current);
      if (intervalId.current !== null) clearInterval(intervalId.current);
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
