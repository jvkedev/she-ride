"use client";

import "leaflet/dist/leaflet.css";

import { useMemo, useRef } from "react";
import { MapContainer, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import AnimatedCaptainMarker from "@/components/maps/animated-captain-marker";
import MapBoundsFitter from "@/components/maps/map-bounds-fitter";
import MapController from "@/components/maps/map-controller";
import MapSmoothFollow from "@/components/maps/map-smooth-follow";
import MapZoomControls from "@/components/maps/map-zoom-controls";
import { filterValidLatLngs } from "@/lib/maps/map-camera";
import { MAP_INDIA_OVERVIEW_CENTER } from "@/lib/maps/map-defaults";
import { cn } from "@/lib/utils";

export type LiveMapMarkerKind =
  | "rider"
  | "captain"
  | "pickup"
  | "drop"
  | "sos";

export type LiveMapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  kind?: LiveMapMarkerKind;
  selected?: boolean;
  trail?: [number, number][];
  vehicleType?: string | null;
};

type LiveTrackingMapProps = {
  markers: LiveMapMarker[];
  className?: string;
  overlay?: React.ReactNode;
  followSelected?: boolean;
  /** Polyline connecting pickup → captain → drop for a selected ride */
  routeLine?: [number, number][];
};

function vehicleEmoji(vehicleType?: string | null) {
  switch (vehicleType) {
    case "BIKE":
      return "🏍️";
    case "AUTO":
      return "🛺";
    case "SUV":
      return "🚙";
    default:
      return "🚗";
  }
}

function createMarkerIcon(kind: LiveMapMarkerKind, selected: boolean) {
  if (kind === "captain") {
    return L.divIcon({
      className: "",
      html: `<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));">🚗</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }

  if (kind === "pickup") {
    return L.divIcon({
      className: "",
      html: `<div style="width:14px;height:14px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  }

  if (kind === "drop") {
    return L.divIcon({
      className: "",
      html: `<div style="width:14px;height:14px;background:#10b981;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  }

  const color = selected ? "#dc2626" : kind === "rider" ? "#ec4899" : "#ef4444";
  const size = selected ? 22 : 18;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 0 0 ${selected ? 4 : 2}px rgba(236,72,153,0.4);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function LiveTrackingMap({
  markers,
  className,
  overlay,
  followSelected = false,
  routeLine,
}: LiveTrackingMapProps) {
  const iconCache = useRef(new Map<string, L.DivIcon>());

  const getIcon = (marker: LiveMapMarker) => {
    const kind = marker.kind ?? "sos";
    const key = `${marker.id}-${kind}-${marker.selected ? 1 : 0}`;
    if (!iconCache.current.has(key)) {
      if (kind === "captain" && marker.vehicleType) {
        iconCache.current.set(
          key,
          L.divIcon({
            className: "",
            html: `<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));">${vehicleEmoji(marker.vehicleType)}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        );
      } else {
        iconCache.current.set(key, createMarkerIcon(kind, !!marker.selected));
      }
    }
    return iconCache.current.get(key)!;
  };

  const validMarkers = useMemo(
    () =>
      markers.filter(
        (m) =>
          Number.isFinite(m.latitude) &&
          Number.isFinite(m.longitude) &&
          !(m.latitude === 0 && m.longitude === 0),
      ),
    [markers],
  );

  const fitPoints = useMemo(() => {
    const pts = validMarkers.flatMap((m) => {
      const main: [number, number] = [m.latitude, m.longitude];
      return m.trail?.length ? [...m.trail, main] : [main];
    });
    if (routeLine?.length) pts.push(...routeLine);
    return filterValidLatLngs(pts);
  }, [validMarkers, routeLine]);

  const selected = validMarkers.find((m) => m.selected);
  const center: [number, number] = selected
    ? [selected.latitude, selected.longitude]
    : (fitPoints[0] ?? MAP_INDIA_OVERVIEW_CENTER);

  const followPosition: [number, number] | null =
    followSelected && selected
      ? [selected.latitude, selected.longitude]
      : null;

  const boundsCameraKey = selected
    ? `sel:${selected.id}`
    : validMarkers.map((m) => m.id).join(",");

  return (
    <div
      className={cn(
        "relative h-full min-h-80 w-full overflow-hidden rounded-2xl border border-neutral-200",
        className,
      )}
    >
      <MapContainer
        center={center}
        zoom={selected ? 15 : fitPoints.length > 0 ? 13 : 5}
        className="h-full w-full"
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

        {routeLine && routeLine.length > 1 && (
          <Polyline
            positions={filterValidLatLngs(routeLine)}
            pathOptions={{
              color: "#6366f1",
              weight: 3,
              opacity: 0.55,
              dashArray: "8 10",
            }}
          />
        )}

        {validMarkers.map((marker) => {
          const pos: [number, number] = [marker.latitude, marker.longitude];
          const trail = filterValidLatLngs(marker.trail ?? []);
          const kind = marker.kind ?? "sos";

          return (
            <span key={marker.id} style={{ display: "contents" }}>
              {trail.length > 1 && (
                <Polyline
                  positions={trail}
                  pathOptions={{
                    color:
                      kind === "captain"
                        ? "#2563eb"
                        : marker.selected
                          ? "#dc2626"
                          : "#f87171",
                    weight: marker.selected ? 4 : 2,
                    opacity: 0.85,
                    dashArray: marker.selected ? undefined : "6 8",
                  }}
                />
              )}
              <AnimatedCaptainMarker position={pos} icon={getIcon(marker)}>
                <Popup>
                  <span className="text-sm font-semibold">{marker.label}</span>
                </Popup>
              </AnimatedCaptainMarker>
            </span>
          );
        })}

        {fitPoints.length > 0 && (
          <MapBoundsFitter
            points={fitPoints}
            mode="single"
            cameraKey={boundsCameraKey}
            padding={[80, 80]}
          />
        )}

        {followPosition && (
          <MapSmoothFollow position={followPosition} enabled throttleMs={800} />
        )}

        <MapController />
        <MapZoomControls />
      </MapContainer>

      {overlay ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3">
          {overlay}
        </div>
      ) : null}
    </div>
  );
}
