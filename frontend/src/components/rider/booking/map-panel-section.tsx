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

type MapPanelSectionProps = {
  pickup?: [number, number];
  drop?: [number, number];
  route?: [number, number][];
  nearbyCaptains?: number;
};

export default function MapPanelSection({
  pickup,
  drop,
  route,
  nearbyCaptains,
}: MapPanelSectionProps) {
  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="absolute inset-0">
        <MapWrapper
          pickup={pickup}
          drop={drop}
          route={route}
          nearbyCaptains={nearbyCaptains}
        />
      </div>
    </div>
  );
}
