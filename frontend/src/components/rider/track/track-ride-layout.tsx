"use client";

import dynamic from "next/dynamic";

import TrackRidePanel from "@/components/rider/track/track-ride-panel";
import { cn } from "@/lib/utils";

const RiderMapPanel = dynamic(
  () => import("@/components/rider/shared/rider-map-panel"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[320px] animate-pulse rounded-2xl bg-neutral-200" />
    ),
  },
);

type TrackRideLayoutProps = {
  pickup: string;
  dropoff: string;
};

export default function TrackRideLayout({ pickup, dropoff }: TrackRideLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden bg-[#f6f6f6]",
        "lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]",
      )}
    >
      <aside className="rider-panel-scroll min-h-0 flex-1 overflow-y-auto border-neutral-200 bg-white lg:flex-none lg:border-r">
        <TrackRidePanel />
      </aside>

      <div className="relative hidden min-h-0 lg:block">
        <div className="absolute inset-0 p-4 lg:p-5">
          <RiderMapPanel
            showRouteLabels
            pickup={pickup}
            dropoff={dropoff}
            className="h-full min-h-0"
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-neutral-200 bg-white p-4 lg:hidden">
        <div className="h-56 min-h-56 overflow-hidden rounded-2xl border border-neutral-200">
          <RiderMapPanel
            showRouteLabels
            pickup={pickup}
            dropoff={dropoff}
            className="h-full min-h-56 rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
}
