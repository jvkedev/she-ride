"use client";

import dynamic from "next/dynamic";

const StaticMap = dynamic(() => import("./static-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-80 w-full items-center justify-center bg-neutral-100 rounded-2xl">
      <div className="size-8 animate-pulse rounded-full bg-neutral-200" />
    </div>
  ),
});

type MapWrapperProps = {
  pickup?: [number, number];
  drop?: [number, number];
  route?: [number, number][];
  routeIsPreview?: boolean;
  nearbyCaptains?: number;
  routeDistanceKm?: number;
  routeDurationMin?: number;
};

export default function MapWrapper({
  pickup,
  drop,
  route,
  routeIsPreview,
  nearbyCaptains,
  routeDistanceKm,
  routeDurationMin,
}: MapWrapperProps) {
  return (
    <div className="h-full min-h-0 w-full">
      <StaticMap
        pickup={pickup}
        drop={drop}
        route={route}
        routeIsPreview={routeIsPreview}
        nearbyCaptains={nearbyCaptains}
        routeDistanceKm={routeDistanceKm}
        routeDurationMin={routeDurationMin}
      />
    </div>
  );
}
