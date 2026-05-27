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
import {
  connectSocket,
  joinRideRoom,
  getRoute,
} from "@/services/socket/socket.service";

const DEFAULT: [number, number] = [28.6139, 77.209];

// Vehicle emoji icon for captain
function createVehicleIcon(vehicleType?: string) {
  const emoji =
    vehicleType === "BIKE"
      ? "🏍️"
      : vehicleType === "AUTO"
        ? "🛺"
        : vehicleType === "SUV"
          ? "🚙"
          : "🚗";

  return L.divIcon({
    className: "",
    html: `<div style="
      font-size:28px;line-height:1;
      filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      user-select:none;
    ">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// Pink dot for rider
function createRiderIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:16px;height:16px;
      background:#ec4899;border:3px solid white;
      border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function getDistanceKm(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number],
) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Pans to a position only when it's a real GPS coord (not DEFAULT)
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
  pickupLat?: number;
  pickupLng?: number;
  vehicleType?: string; // so we can show correct emoji
}

export default function RideLiveMap({
  rideId,
  pickupLat,
  pickupLng,
  vehicleType,
}: RideLiveMapProps) {
  // Captain location (from socket)
  const [captainPos, setCaptainPos] = useState<[number, number] | null>(null);
  const [hasCaptain, setHasCaptain] = useState(false);

  // Rider's own live location
  const [riderPos, setRiderPos] = useState<[number, number]>(DEFAULT);
  const [hasRiderGps, setHasRiderGps] = useState(false);

  const [rideStatus, setRideStatus] = useState<string>("SEARCHING");
  const [path, setPath] = useState<[number, number][]>([]);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distanceToCaptain, setDistanceToCaptain] = useState<number | null>(
    null,
  );

  const watchId = useRef<number | null>(null);
  const captainIcon = useRef(createVehicleIcon(vehicleType));
  const riderIcon = useRef(createRiderIcon());

  // Update captain icon when vehicle type changes
  useEffect(() => {
    captainIcon.current = createVehicleIcon(vehicleType);
  }, [vehicleType]);

  // Rider's own GPS — updates every 3s
  useEffect(() => {
    if (!navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude);
        const lng = Number(pos.coords.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        setRiderPos([lat, lng]);
        setHasRiderGps(true);
      },
      (err) => console.error("Rider GPS error:", err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 },
    );

    return () => {
      if (watchId.current !== null)
        navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  // Socket — listen for captain location updates
  useEffect(() => {
    if (!rideId) return;

    const token = localStorage.getItem("accessToken") ?? "";
    let payload: { sub: string } | null = null;
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch {
      return;
    }

    const socket = connectSocket(payload!.sub);
    joinRideRoom(rideId);

    socket.on(
      "captain:location",
      async (data: { lat: number; lng: number }) => {
        if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) return;
        const pos: [number, number] = [data.lat, data.lng];
        setCaptainPos(pos);
        setHasCaptain(true);
        setPath((prev) => [...prev, pos]);

        // OSRM route: captain → pickup
        if (pickupLat && pickupLng) {
          const osrmRoute = await getRoute(
            data.lat,
            data.lng,
            pickupLat,
            pickupLng,
          );
          if (osrmRoute.length > 1) setRoute(osrmRoute);
        }
      },
    );

    socket.on("ride:accepted", (data: { status: string }) => {
      setRideStatus(data.status);
    });

    socket.on("ride:status", (data: { status: string }) => {
      setRideStatus(data.status);
    });

    // Fallback poll every 5s for status
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/rides/${rideId}/captain-location`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (data.status) setRideStatus(data.status);
        if (
          data.lat &&
          data.lng &&
          Number.isFinite(data.lat) &&
          Number.isFinite(data.lng)
        ) {
          setCaptainPos([data.lat, data.lng]);
          setHasCaptain(true);
        }
      } catch {
        // silently ignore
      }
    }, 5000);

    return () => {
      socket.off("captain:location");
      socket.off("ride:accepted");
      socket.off("ride:status");
      clearInterval(interval);
    };
  }, [rideId, pickupLat, pickupLng]);

  useEffect(() => {
    if (captainPos && hasRiderGps) {
      setDistanceToCaptain(getDistanceKm(captainPos, riderPos));
    } else {
      setDistanceToCaptain(null);
    }
  }, [captainPos, riderPos, hasRiderGps]);

  const config = statusConfig[rideStatus];

  // Pan to captain when found, otherwise rider
  const focusPos = hasCaptain ? captainPos! : hasRiderGps ? riderPos : DEFAULT;
  const hasFocus = hasCaptain || hasRiderGps;

  return (
    <div className="relative h-full w-full">
      {/* Status banner */}
      {config && (
        <div className="absolute top-3 left-1/2 z-1000 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-md">
          <span className={config.color}>{config.icon}</span>
          <span className="text-neutral-700">
            {config.label}
            {distanceToCaptain !== null && hasCaptain && hasRiderGps && (
              <>
                {" "}
                {` · ${
                  distanceToCaptain < 1
                    ? `${Math.round(distanceToCaptain * 1000)}m away`
                    : `${distanceToCaptain.toFixed(1)} km away`
                }`}
              </>
            )}
          </span>
        </div>
      )}

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

        {/* OSRM shortest route — blue */}
        {route.length > 1 && (
          <Polyline
            positions={route}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Captain movement trail — pink */}
        {path.length > 1 && (
          <Polyline positions={path} color="#ec4899" weight={2} opacity={0.4} />
        )}

        {hasCaptain && hasRiderGps && captainPos && (
          <Polyline
            positions={[riderPos, captainPos]}
            color="#f59e0b"
            dashArray="8,8"
            weight={3}
            opacity={0.75}
          />
        )}

        {/* Captain marker — vehicle emoji */}
        {hasCaptain && captainPos && (
          <Marker position={captainPos} icon={captainIcon.current}>
            <Popup>Captain is here</Popup>
          </Marker>
        )}

        {/* Rider marker — pink dot */}
        {hasRiderGps && (
          <Marker position={riderPos} icon={riderIcon.current}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        <MapPanner position={focusPos} hasRealGps={hasFocus} />
        <MapController />
        <MapZoomControls />
      </MapContainer>
    </div>
  );
}
