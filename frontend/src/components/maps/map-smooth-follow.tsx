"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { LatLngTuple } from "@/lib/maps/map-camera";

type MapSmoothFollowProps = {
  position: LatLngTuple | null;
  enabled?: boolean;
  /** Minimum pan interval (ms) to avoid jitter */
  throttleMs?: number;
};

/** Pans the map to a moving marker without changing zoom (between bounds refits). */
export default function MapSmoothFollow({
  position,
  enabled = true,
  throttleMs = 1200,
}: MapSmoothFollowProps) {
  const map = useMap();
  const lastPan = useRef(0);

  useEffect(() => {
    if (!enabled || !position) return;
    if (!Number.isFinite(position[0]) || !Number.isFinite(position[1])) return;

    const now = Date.now();
    if (now - lastPan.current < throttleMs) return;
    lastPan.current = now;

    const bounds = map.getBounds();
    if (bounds.contains(position)) return;

    map.panTo(position, { animate: true, duration: 0.65 });
  }, [position, enabled, map, throttleMs]);

  return null;
}
