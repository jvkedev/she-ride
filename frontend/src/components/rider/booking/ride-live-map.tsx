"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import MapController from "@/components/maps/map-controller";
import MapZoomControls from "@/components/maps/map-zoom-controls";
import axios from "axios";
import React from "react";
import {
  Search,
  CheckCircle,
  Car,
  Navigation,
  CheckCheck,
  XCircle,
} from "lucide-react";

const CaptainIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DEFAULT: [number, number] = [28.6139, 77.209];

interface StatusConfig {
  icon: React.ReactNode;
  label: string;
  color: string;
}

const statusConfig: Record<string, StatusConfig> = {
  SEARCHING: {
    icon: <Search className="h-4 w-4" />,
    label: "Looking for a captain...",
    color: "text-blue-500",
  },
  ACCEPTED: {
    icon: <CheckCircle className="h-4 w-4" />,
    label: "Captain accepted!",
    color: "text-green-500",
  },
  ARRIVING: {
    icon: <Car className="h-4 w-4" />,
    label: "Captain is on the way",
    color: "text-orange-500",
  },
  IN_PROGRESS: {
    icon: <Navigation className="h-4 w-4" />,
    label: "Ride in progress",
    color: "text-purple-500",
  },
  COMPLETED: {
    icon: <CheckCheck className="h-4 w-4" />,
    label: "Ride completed",
    color: "text-green-600",
  },
  CANCELED: {
    icon: <XCircle className="h-4 w-4" />,
    label: "Ride cancelled",
    color: "text-red-500",
  },
};

interface RideLiveMapProps {
  rideId: string;
}

export default function RideLiveMap({ rideId }: RideLiveMapProps) {
  const [captainPos, setCaptainPos] = useState<[number, number] | null>(null);
  const [rideStatus, setRideStatus] = useState<string>("SEARCHING");

  useEffect(() => {
    if (!rideId) return;

    async function fetchCaptainLocation() {
      try {
        const token = localStorage.getItem("accessToken") ?? "";
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/rides/${rideId}/captain-location`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setRideStatus(data.status);

        if (data.lat && data.lng) {
          setCaptainPos([data.lat, data.lng]);
        }
      } catch (err) {
        console.error("Failed to fetch captain location:", err);
      }
    }

    fetchCaptainLocation();
    const interval = setInterval(fetchCaptainLocation, 5000);
    return () => clearInterval(interval);
  }, [rideId]);

  const center = captainPos ?? DEFAULT;
  const config = statusConfig[rideStatus];

  return (
    <div className="relative h-full w-full">
      {config && (
        <div className="absolute top-3 left-1/2 z-1000 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-md">
          <span className={config.color}>{config.icon}</span>
          <span className="text-neutral-700">{config.label}</span>
        </div>
      )}

      <MapContainer
        center={center}
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
        {captainPos && (
          <Marker position={captainPos} icon={CaptainIcon}>
            <Popup>Captain is here</Popup>
          </Marker>
        )}
        <MapController />
        <MapZoomControls />
      </MapContainer>
    </div>
  );
}
