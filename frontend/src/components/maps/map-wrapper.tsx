"use client";

import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("./live-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] w-full items-center justify-center bg-neutral-100">
      <div className="size-8 animate-pulse rounded-full bg-neutral-200" />
    </div>
  ),
});

export default function MapWrapper() {
  return (
    <div className="h-full min-h-0 w-full">
      <LiveMap />
    </div>
  );
}
