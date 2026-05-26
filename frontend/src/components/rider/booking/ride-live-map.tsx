"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef } from "react";
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
import axiosClient from "@/services/api/axios-client";
import React from "react";
import {
  Search,
  CheckCircle,
  Car,
  Navigation,
  CheckCheck,
  XCircle,
} from "lucide-react";
import {
  connectSocket,
  joinRideRoom,
  getRoute,
} from "@/services/socket/socket.service";
import { cancelRide } from "@/services/rides/rides.service";

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

const CANCELLABLE = ["SEARCHING", "ACCEPTED", "ARRIVING"];

function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

interface RideLiveMapProps {
  rideId: string;
  pickupLat?: number;
  pickupLng?: number;
}

export default function RideLiveMap({
  rideId,
  pickupLat,
  pickupLng,
}: RideLiveMapProps) {
  const [captainPos, setCaptainPos] = useState<[number, number] | null>(null);
  const [rideStatus, setRideStatus] = useState<string>("SEARCHING");
  const [cancelling, setCancelling] = useState(false);
  const [path, setPath] = useState<[number, number][]>([]);
  const [route, setRoute] = useState<[number, number][]>([]);

  const pickupLatRef = useRef(pickupLat);
  const pickupLngRef = useRef(pickupLng);

  useEffect(() => {
    pickupLatRef.current = pickupLat;
    pickupLngRef.current = pickupLng;
  }, [pickupLat, pickupLng]);

  useEffect(() => {
    if (!rideId) return;

    const token = localStorage.getItem("accessToken") ?? "";
    let payload: { sub: string; role: string };

    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch {
      return;
    }

    const socket = connectSocket(payload.sub);

    const doJoin = () => {
      socket.emit("register", { userId: payload.sub });
      joinRideRoom(rideId);
    };

    if (socket.connected) {
      doJoin();
    } else {
      socket.once("connect", doJoin);
    }

    socket.on(
      "captain:location",
      async (data: { lat: number; lng: number }) => {
        const pos: [number, number] = [data.lat, data.lng];
        setCaptainPos(pos);
        setPath((prev) => [...prev, pos]);

        const pLat = pickupLatRef.current;
        const pLng = pickupLngRef.current;

        if (pLat && pLng) {
          const osrmRoute = await getRoute(data.lat, data.lng, pLat, pLng);
          setRoute(osrmRoute);
        }
      },
    );

    socket.on("ride:accepted", (data: { status: string }) => {
      setRideStatus(data.status);
    });

    socket.on("ride:status", (data: { status: string }) => {
      setRideStatus(data.status);
      // Auto-redirect on cancel from captain side
      if (data.status === "CANCELED") {
        setTimeout(() => {
          window.location.href = "/rider";
        }, 2000);
      }
    });

    const interval = setInterval(async () => {
      try {
        const { data } = await axiosClient.get(
          `${process.env.NEXT_PUBLIC_API_URL}/rides/${rideId}/captain-location`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setRideStatus(data.status);
        if (data.lat && data.lng) {
          setCaptainPos([data.lat, data.lng]);
        }
      } catch {}
    }, 5000);

    return () => {
      socket.off("captain:location");
      socket.off("ride:accepted");
      socket.off("ride:status");
      socket.off("connect", doJoin);
      clearInterval(interval);
    };
  }, [rideId]);

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this ride?")) return;
    try {
      setCancelling(true);
      await cancelRide(rideId, "Cancelled by rider");
      window.location.href = "/rider";
    } catch {
      alert("Failed to cancel ride. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  const center = captainPos ?? DEFAULT;
  const config = statusConfig[rideStatus];

  return (
    <div className="relative h-full w-full">
      {/* Status banner */}
      {config && (
        <div className="absolute top-3 left-1/2 z-1000 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-md">
          <span className={config.color}>{config.icon}</span>
          <span className="text-neutral-700">{config.label}</span>
        </div>
      )}

      {/* Cancel button — only when cancellable */}
      {CANCELLABLE.includes(rideStatus) && (
        <div className="absolute bottom-4 left-1/2 z-1000 -translate-x-1/2 w-[calc(100%-2rem)]">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full rounded-xl border border-red-200 bg-white py-3 text-sm font-medium text-red-500 shadow-md hover:bg-red-50 disabled:opacity-50 transition"
          >
            {cancelling ? "Cancelling..." : "Cancel Ride"}
          </button>
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

        {captainPos && <MapRecenter position={captainPos} />}

        {route.length > 1 && (
          <Polyline
            positions={route}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
          />
        )}

        {path.length > 1 && (
          <Polyline positions={path} color="#ec4899" weight={2} opacity={0.5} />
        )}

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
