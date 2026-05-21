"use client";

import dynamic from "next/dynamic";

import MapRouteLabels from "@/components/rider/shared/map-route-labels";
import { cn } from "@/lib/utils";

const MapPanelSection = dynamic(
  () => import("@/components/rider/booking/map-panel-section"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[320px] animate-pulse rounded-2xl bg-neutral-200" />
    ),
  },
);

type RiderMapPanelProps = {
  showRouteLabels?: boolean;
  pickup?: string;
  dropoff?: string;
  className?: string;
};

export default function RiderMapPanel({
  showRouteLabels = false,
  pickup = "ITL Twin Tower",
  dropoff = "Century Public School",
  className,
}: RiderMapPanelProps) {
  return (
    <div
      className={cn(
        "relative h-full min-h-[320px] w-full overflow-hidden rounded-2xl",
        className,
      )}
    >
      <MapPanelSection />
      {showRouteLabels ? (
        <MapRouteLabels pickup={pickup} dropoff={dropoff} />
      ) : null}
    </div>
  );
}
