"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Ensures pan/zoom handlers are active after dynamic mount and layout resize. */
export default function MapController() {
  const map = useMap();

  useEffect(() => {
    map.dragging.enable();
    map.touchZoom.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();

    const refresh = () => {
      map.invalidateSize({ animate: false });
    };

    refresh();
    const timer = window.setTimeout(refresh, 150);

    const observer = new ResizeObserver(refresh);
    observer.observe(map.getContainer());

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [map]);

  return null;
}
