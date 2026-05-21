"use client";

import dynamic from "next/dynamic";

const MapWrapper = dynamic(() => import("@/components/maps/map-wrapper"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-neutral-100">
      <div className="size-8 animate-pulse rounded-full bg-neutral-200" />
    </div>
  ),
});

export default function MapPanelSection() {
  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="absolute inset-0">
        <MapWrapper />
      </div>
    </div>
  );
}
