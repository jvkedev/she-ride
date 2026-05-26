"use client";

import dynamic from "next/dynamic";
import { CaptainMapSkeleton } from "@/components/captain/shared/captain-loading-skeleton";
import { cn } from "@/lib/utils";

const LiveMap = dynamic(() => import("@/components/maps/live-map"), {
  ssr: false,
  loading: () => <CaptainMapSkeleton />,
});

type CaptainMapPanelProps = {
  className?: string;
  overlay?: React.ReactNode;
  rideId?: string;
};

export default function CaptainMapPanel({
  className,
  overlay,
  rideId,
}: CaptainMapPanelProps) {
  return (
    <div
      className={cn(
        "relative h-full min-h-0 w-full overflow-hidden rounded-2xl",
        className,
      )}
    >
      {/* key forces LiveMap to remount when rideId changes */}
      <LiveMap key={rideId ?? "no-ride"} rideId={rideId} />
      {overlay ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3">
          {overlay}
        </div>
      ) : null}
    </div>
  );
}
