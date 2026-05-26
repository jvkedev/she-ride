"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/shared/dashboard/loading-skeleton";
import { cn } from "@/lib/utils";

const MapPanelSection = dynamic(
  () => import("@/components/rider/booking/map-panel-section"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full min-h-80 w-full rounded-2xl" />,
  },
);

type AdminLiveMapProps = {
  className?: string;
  overlay?: React.ReactNode;
};

export default function AdminLiveMap({ className, overlay }: AdminLiveMapProps) {
  return (
    <div
      className={cn(
        "relative h-full min-h-80 w-full overflow-hidden rounded-2xl",
        className,
      )}
    >
      <MapPanelSection />
      {overlay ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3">
          {overlay}
        </div>
      ) : null}
    </div>
  );
}
