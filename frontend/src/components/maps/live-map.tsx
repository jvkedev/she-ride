"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import MapController from "@/components/maps/map-controller";
import MapZoomControls from "@/components/maps/map-zoom-controls";
import MapBoundsFitter from "@/components/maps/map-bounds-fitter";
import MapSmoothFollow from "@/components/maps/map-smooth-follow";
import {
  connectSocket,
  joinRideRoom,
  sendCaptainLocation,
} from "@/services/socket/socket.service";
import { updateLocation } from "@/services/captain/captain-rides.service";
import { filterValidLatLngs } from "@/lib/maps/map-camera";
import { subscribeLiveLocation } from "@/lib/maps/geolocation";
import {
  getRouteWithMeta,
  formatDistance,
  formatDuration,
} from "@/services/routing/routing.service";
import { useCaptainStore } from "@/store/captain.store";
import { rideStatusToCameraMode } from "@/lib/maps/map-camera";

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

interface LiveMapProps {
  rideId?: string;
  vehicleType?: string;
}

export default function LiveMap({ rideId, vehicleType }: LiveMapProps) {
  const { activeRideId, activeRide } = useCaptainStore();

  const [position, setPosition] = useState<[number, number]>(DEFAULT);
  const [hasRealGps, setHasRealGps] = useState(false);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [routeLabel, setRouteLabel] = useState("");

  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestPos = useRef<[number, number]>(DEFAULT);
  const rideIdRef = useRef<string | undefined>(
    rideId ?? activeRideId ?? undefined,
  );
  const userIdRef = useRef<string | null>(null);
  const captainIcon = useRef(createVehicleIcon(vehicleType));
  const pickupIcon = useRef(createPickupIcon());
  const dropIcon = useRef(createDropIcon());

  const currentRideId = rideId ?? activeRideId ?? undefined;
  const ride = activeRide;
  const rideStatus = ride?.status ?? "ACCEPTED";
  const vType = vehicleType ?? ride?.vehicleType;

  useEffect(() => {
    rideIdRef.current = currentRideId;
  }, [currentRideId]);

  useEffect(() => {
    captainIcon.current = createVehicleIcon(vType);
  }, [vType]);

  const refreshRoute = useCallback(async () => {
    if (!ride || !hasRealGps) return;

    const [lat, lng] = latestPos.current;
    const toPickup = ["ACCEPTED", "ARRIVING", "SEARCHING"].includes(rideStatus);

    const targetLat = toPickup ? ride.pickupLat : ride.dropLat;
    const targetLng = toPickup ? ride.pickupLng : ride.dropLng;

    const result = await getRouteWithMeta(lat, lng, targetLat, targetLng);
    if (result.coordinates.length > 1) {
      setRoute(result.coordinates);
      setRouteLabel(
        `${formatDistance(result.distanceKm)} · ${formatDuration(result.durationMinutes)}`,
      );
    }
  }, [ride, rideStatus, hasRealGps]);

  useEffect(() => {
    refreshRoute();
    const routeInterval = setInterval(refreshRoute, 15000);
    return () => clearInterval(routeInterval);
  }, [refreshRoute]);

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

    const socket = connectSocket(payload.sub, {
      role: "CAPTAIN",
      vehicleType: vType ?? ride?.vehicleType,
    });

    void fetch(`${process.env.NEXT_PUBLIC_API_URL}/captain/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => {
        if (profile?.vehicleType) {
          socket.emit("register", {
            userId: payload!.sub,
            role: "CAPTAIN",
            vehicleType: profile.vehicleType,
          });
        }
      })
      .catch(() => {});

    if (currentRideId) {
      joinRideRoom(currentRideId);
    }

    const stopGps = subscribeLiveLocation(
      (result) => {
        const coords: [number, number] = [
          result.latitude,
          result.longitude,
        ];
        setPosition(coords);
        setHasRealGps(true);
        latestPos.current = coords;
      },
      (err) => console.warn("GPS error:", err.message),
    );

    intervalId.current = setInterval(() => {
      const [lat, lng] = latestPos.current;
      const rid = rideIdRef.current;
      const userId = userIdRef.current;

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      updateLocation(lat, lng).catch(() => {});

      if (rid && userId) {
        sendCaptainLocation(rid, userId, lat, lng);
      }
    }, 3000);

    return () => {
      stopGps();
      if (intervalId.current !== null) clearInterval(intervalId.current);
      socket.off("connect");
    };
  }, [currentRideId]);

  const cameraMode = ride
    ? rideStatusToCameraMode(rideStatus, "captain")
    : "single";

  const cameraPoints = useMemo(() => {
    if (!hasRealGps) return [];
    const pts: [number, number][] = [position];
    if (ride) {
      if (rideStatus === "IN_PROGRESS") {
        pts.push([ride.dropLat, ride.dropLng]);
      } else {
        pts.push([ride.pickupLat, ride.pickupLng]);
      }
    }
    return filterValidLatLngs(pts);
  }, [ride, rideStatus, hasRealGps, position]);

  const cameraKey = ride
    ? `${rideStatus}-${position[0].toFixed(3)}-${position[1].toFixed(3)}-${route.length}`
    : "idle";

  return (
    <div className="relative h-full w-full">
      {routeLabel && (
        <div className="absolute top-3 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-800 shadow-md">
          {rideStatus === "IN_PROGRESS" ? "To destination" : "To pickup"} ·{" "}
          {routeLabel}
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

        {route.length > 1 && (
          <Polyline
            positions={route}
            color="#3b82f6"
            weight={5}
            opacity={0.85}
          />
        )}

        {ride && (
          <>
            <Marker
              position={[ride.pickupLat, ride.pickupLng]}
              icon={pickupIcon.current}
            >
              <Popup>Pickup</Popup>
            </Marker>
            <Marker
              position={[ride.dropLat, ride.dropLng]}
              icon={dropIcon.current}
            >
              <Popup>Destination</Popup>
            </Marker>
          </>
        )}

        {hasRealGps && (
          <Marker position={position} icon={captainIcon.current}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {cameraPoints.length > 0 && (
          <MapBoundsFitter
            points={cameraPoints}
            route={route}
            mode={cameraMode}
            cameraKey={cameraKey}
            padding={[88, 88]}
          />
        )}

        {hasRealGps && ride && (
          <MapSmoothFollow position={position} throttleMs={1500} />
        )}

        <MapController />
        <MapZoomControls />
      </MapContainer>
    </div>
  );
}
