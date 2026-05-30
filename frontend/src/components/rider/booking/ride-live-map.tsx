"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import RoutePolyline from "@/components/maps/route-polyline";
import AnimatedCaptainMarker from "@/components/maps/animated-captain-marker";
import { buildPreviewRoute } from "@/services/routing/routing.service";
import L from "leaflet";
import MapController from "@/components/maps/map-controller";
import MapZoomControls from "@/components/maps/map-zoom-controls";
import MapBoundsFitter from "@/components/maps/map-bounds-fitter";
import MapSmoothFollow from "@/components/maps/map-smooth-follow";
import {
  rideStatusToCameraMode,
  type MapCameraMode,
} from "@/lib/maps/map-camera";
import axios from "axios";
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
} from "@/services/socket/socket.service";
import {
  getRouteWithMeta,
  formatDistance,
  formatDuration,
} from "@/services/routing/routing.service";

import { MAP_INDIA_OVERVIEW_CENTER } from "@/lib/maps/map-defaults";

const DEFAULT: [number, number] = MAP_INDIA_OVERVIEW_CENTER;

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
    html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));user-select:none;">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function createPickupIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function createDropIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;background:#10b981;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
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
    label: "Captain accepted",
    color: "text-green-500",
  },
  ARRIVING: {
    icon: <Car className="h-4 w-4" />,
    label: "Captain is arriving",
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

export interface RideLiveMapProps {
  rideId: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  tripRoute?: [number, number][];
  vehicleType?: string;
  initialStatus?: string;
}

export default function RideLiveMap({
  rideId,
  pickupLat,
  pickupLng,
  dropLat,
  dropLng,
  tripRoute = [],
  vehicleType,
  initialStatus = "SEARCHING",
}: RideLiveMapProps) {
  const [captainPos, setCaptainPos] = useState<[number, number] | null>(null);
  const [hasCaptain, setHasCaptain] = useState(false);
  const [rideStatus, setRideStatus] = useState(initialStatus);
  const [navRoute, setNavRoute] = useState<[number, number][]>([]);
  const [trail, setTrail] = useState<[number, number][]>([]);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [captainName, setCaptainName] = useState<string | null>(null);

  const captainIcon = useRef(createVehicleIcon(vehicleType));
  const pickupIcon = useRef(createPickupIcon());
  const dropIcon = useRef(createDropIcon());
  const lastRouteCalc = useRef(0);
  const rideStatusRef = useRef(rideStatus);

  useEffect(() => {
    rideStatusRef.current = rideStatus;
    lastRouteCalc.current = 0;
  }, [rideStatus]);

  useEffect(() => {
    captainIcon.current = createVehicleIcon(vehicleType);
  }, [vehicleType]);

  const updateRoute = useCallback(
    async (capLat: number, capLng: number, status: string) => {
      const now = Date.now();
      if (now - lastRouteCalc.current < 8000) return;
      lastRouteCalc.current = now;

      const toPickup = ["SEARCHING", "ACCEPTED", "ARRIVING"].includes(status);
      const targetLat = toPickup ? pickupLat : dropLat;
      const targetLng = toPickup ? pickupLng : dropLng;

      if (
        targetLat == null ||
        targetLng == null ||
        !Number.isFinite(targetLat) ||
        !Number.isFinite(targetLng)
      ) {
        return;
      }

      const preview =
        buildPreviewRoute(capLat, capLng, targetLat, targetLng);
      setNavRoute(preview);

      const result = await getRouteWithMeta(capLat, capLng, targetLat, targetLng);
      if (result.coordinates.length > 1) {
        setNavRoute(result.coordinates);
        setEtaMinutes(result.durationMinutes);
        setRouteDistanceKm(result.distanceKm);
      }
    },
    [pickupLat, pickupLng, dropLat, dropLng],
  );

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

    const onCaptainLocation = (data: { lat: number; lng: number }) => {
      if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) return;
      const pos: [number, number] = [data.lat, data.lng];
      setCaptainPos(pos);
      setHasCaptain(true);
      setTrail((prev) => {
        const last = prev[prev.length - 1];
        if (last && last[0] === pos[0] && last[1] === pos[1]) return prev;
        return [...prev.slice(-40), pos];
      });
      void updateRoute(data.lat, data.lng, rideStatusRef.current);
    };

    socket.on("captain:location", onCaptainLocation);

    socket.on(
      "ride:accepted",
      (data: { status: string; captain?: { name: string } }) => {
        setRideStatus(data.status);
        if (data.captain?.name) setCaptainName(data.captain.name);
      },
    );

    socket.on("ride:status", (data: { status: string }) => {
      setRideStatus(data.status);
      lastRouteCalc.current = 0;
      if (captainPos) {
        void updateRoute(captainPos[0], captainPos[1], data.status);
      }
    });

    const poll = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/rides/${rideId}/captain-location`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (data.status) setRideStatus(data.status);
        if (
          data.lat != null &&
          data.lng != null &&
          Number.isFinite(data.lat) &&
          Number.isFinite(data.lng)
        ) {
          onCaptainLocation({ lat: data.lat, lng: data.lng });
        }
      } catch {
        // ignore
      }
    };

    poll();
    const interval = setInterval(poll, 5000);

    return () => {
      socket.off("captain:location", onCaptainLocation);
      socket.off("ride:accepted");
      socket.off("ride:status");
      clearInterval(interval);
    };
  }, [rideId, updateRoute]);

  const config = statusConfig[rideStatus] ?? statusConfig.SEARCHING;

  const cameraMode: MapCameraMode =
    rideStatus === "IN_PROGRESS"
      ? "active-trip"
      : hasCaptain && captainPos
        ? rideStatusToCameraMode(rideStatus, "rider")
        : pickupLat != null && pickupLng != null
          ? "single"
          : "single";

  const cameraPoints: [number, number][] = useMemo(() => {
    if (rideStatus === "IN_PROGRESS" && captainPos) {
      const pts: [number, number][] = [captainPos];
      if (dropLat != null && dropLng != null) pts.push([dropLat, dropLng]);
      return pts;
    }
    if (hasCaptain && captainPos && pickupLat != null && pickupLng != null) {
      return [captainPos, [pickupLat, pickupLng]];
    }
    if (pickupLat != null && pickupLng != null) {
      return [[pickupLat, pickupLng]];
    }
    return [];
  }, [
    rideStatus,
    hasCaptain,
    captainPos,
    pickupLat,
    pickupLng,
    dropLat,
    dropLng,
  ]);

  const cameraKey = `${rideStatus}-${captainPos?.[0]?.toFixed(3) ?? ""}-${captainPos?.[1]?.toFixed(3) ?? ""}-${navRoute.length}`;

  const tripPolyline =
    tripRoute.length > 1
      ? tripRoute
      : pickupLat != null &&
          pickupLng != null &&
          dropLat != null &&
          dropLng != null
        ? buildPreviewRoute(pickupLat, pickupLng, dropLat, dropLng)
        : [];

  return (
    <div className="relative h-full w-full">
      {config && (
        <div className="absolute top-3 left-1/2 z-[1000] -translate-x-1/2 flex max-w-[90%] flex-col items-center gap-0.5 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-md">
          <span className={`flex items-center gap-2 ${config.color}`}>
            {config.icon}
            <span className="text-neutral-700">
              {config.label}
              {captainName ? ` · ${captainName}` : ""}
            </span>
          </span>
          {etaMinutes != null && hasCaptain && rideStatus !== "COMPLETED" && (
            <span className="text-xs text-neutral-500">
              ETA ~{formatDuration(etaMinutes)}
              {routeDistanceKm != null
                ? ` · ${formatDistance(routeDistanceKm)}`
                : ""}
            </span>
          )}
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

        <RoutePolyline positions={tripPolyline} variant="muted" />

        <RoutePolyline positions={navRoute} variant="primary" />

        {trail.length > 1 && (
          <RoutePolyline positions={trail} variant="preview" />
        )}

        {pickupLat != null && pickupLng != null && (
          <Marker position={[pickupLat, pickupLng]} icon={pickupIcon.current}>
            <Popup>Pickup</Popup>
          </Marker>
        )}

        {dropLat != null && dropLng != null && (
          <Marker position={[dropLat, dropLng]} icon={dropIcon.current}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        <AnimatedCaptainMarker
          position={hasCaptain ? captainPos : null}
          icon={captainIcon.current}
        />

        {cameraPoints.length > 0 && (
          <MapBoundsFitter
            points={cameraPoints}
            route={navRoute.length > 1 ? navRoute : tripPolyline}
            mode={cameraMode}
            cameraKey={cameraKey}
            padding={[88, 88]}
          />
        )}

        {hasCaptain && captainPos && (
          <MapSmoothFollow position={captainPos} enabled />
        )}

        <MapController />
        <MapZoomControls />
      </MapContainer>
    </div>
  );
}
