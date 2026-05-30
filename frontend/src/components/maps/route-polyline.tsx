"use client";

import { useMemo } from "react";
import { Polyline } from "react-leaflet";
import { filterValidLatLngs } from "@/lib/maps/map-camera";

type RoutePolylineProps = {
  positions: [number, number][];
  variant?: "primary" | "preview" | "muted";
};

const STYLES = {
  primary: { color: "#2563eb", weight: 5, opacity: 0.9, dashArray: undefined },
  preview: { color: "#60a5fa", weight: 4, opacity: 0.65, dashArray: "10,10" },
  muted: { color: "#94a3b8", weight: 3, opacity: 0.5, dashArray: "6,8" },
};

export default function RoutePolyline({
  positions,
  variant = "primary",
}: RoutePolylineProps) {
  const safePositions = useMemo(
    () => filterValidLatLngs(positions),
    [positions],
  );

  if (safePositions.length < 2) return null;

  const style = STYLES[variant];

  return (
    <Polyline
      positions={safePositions}
      pathOptions={{
        color: style.color,
        weight: style.weight,
        opacity: style.opacity,
        dashArray: style.dashArray,
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  );
}
