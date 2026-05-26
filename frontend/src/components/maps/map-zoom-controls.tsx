"use client";

import { useMap } from "react-leaflet";
import { LocateFixed, Minus, Plus } from "lucide-react";

export default function MapZoomControls() {
  const map = useMap();

  return (
    <div className="pointer-events-none absolute inset-0 z-1000">
      <div className="pointer-events-auto absolute right-4 bottom-4 flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-md">
        <button
          type="button"
          aria-label="Locate me"
          onClick={() => map.setView(map.getCenter(), map.getZoom())}
          className="flex size-10 items-center justify-center border-b border-neutral-200 text-neutral-700 transition hover:bg-neutral-50"
        >
          <LocateFixed className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => map.zoomIn()}
          className="flex size-10 items-center justify-center border-b border-neutral-200 text-neutral-900 transition hover:bg-neutral-50"
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => map.zoomOut()}
          className="flex size-10 items-center justify-center text-neutral-900 transition hover:bg-neutral-50"
        >
          <Minus className="size-4" />
        </button>
      </div>
    </div>
  );
}
