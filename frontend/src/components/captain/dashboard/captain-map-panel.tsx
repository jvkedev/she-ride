"use client";

import dynamic from "next/dynamic";

import { CaptainMapSkeleton } from "@/components/captain/shared/captain-loading-skeleton";
import { cn } from "@/lib/utils";

const MapPanelSection = dynamic(
  () => import("@/components/rider/booking/map-panel-section"),
  {
    ssr: false,
    loading: () => <CaptainMapSkeleton />,
  },
);

type CaptainMapPanelProps = {
  className?: string;
  overlay?: React.ReactNode;
};

export default function CaptainMapPanel({
  className,
  overlay,
}: CaptainMapPanelProps) {
  return (
    <div
      className={cn(
        "relative h-full min-h-[280px] w-full overflow-hidden rounded-2xl",
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
