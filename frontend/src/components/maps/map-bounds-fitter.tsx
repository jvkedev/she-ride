"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type L from "leaflet";
import {
  applyMapCamera,
  filterValidLatLngs,
  type MapCameraMode,
  type LatLngTuple,
} from "@/lib/maps/map-camera";

type MapBoundsFitterProps = {
  points: LatLngTuple[];
  route?: LatLngTuple[];
  mode?: MapCameraMode;
  padding?: [number, number];
  animate?: boolean;
  /** Change to re-run camera (e.g. status or captain position). */
  cameraKey?: string;
};

export default function MapBoundsFitter({
  points,
  route,
  mode = "pickup-drop-preview",
  padding = [72, 72],
  animate = true,
  cameraKey = "",
}: MapBoundsFitterProps) {
  const map = useMap();
  const lastKey = useRef("");

  useEffect(() => {
    const valid = filterValidLatLngs(points);
    const safeRoute = filterValidLatLngs(route ?? []);
    if (valid.length === 0) return;

    const key = `${mode}|${cameraKey}|${valid.map((p) => p.join(",")).join(";")}|${safeRoute.length}`;
    if (key === lastKey.current) return;
    lastKey.current = key;

    let cancelled = false;
    let rafId = 0;

    const run = () => {
      if (cancelled) return;
      try {
        applyMapCamera(map, {
          mode: valid.length === 1 ? "single" : mode,
          points: valid,
          route: safeRoute,
          padding,
          animate,
        });
      } catch {
        // Invalid bounds or map not ready
      }
    };

    const schedule = () => {
      rafId = window.requestAnimationFrame(() => {
        if (cancelled) return;
        run();
      });
    };

    if ((map as L.Map & { _loaded?: boolean })._loaded) {
      schedule();
    } else {
      map.whenReady(schedule);
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
    };
  }, [map, points, route, mode, padding, animate, cameraKey]);

  return null;
}
