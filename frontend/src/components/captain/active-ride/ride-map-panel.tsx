"use client";

import CaptainMapPanel from "@/components/captain/dashboard/captain-map-panel";

export default function RideMapPanel() {
  return (
    <CaptainMapPanel
      className="h-full min-h-0 lg:min-h-0"
      overlay={
        <div className="w-fit rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs font-medium text-neutral-800 shadow-sm backdrop-blur-sm">
          En route · 2.4 km remaining
        </div>
      }
    />
  );
}
