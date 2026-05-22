"use client";

import dynamic from "next/dynamic";

import { CaptainMapSkeleton } from "@/components/captain/shared/captain-loading-skeleton";

const ActiveRideLayout = dynamic(
  () => import("@/components/captain/active-ride/active-ride-layout"),
  {
    loading: () => (
      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="h-8 w-40 animate-pulse rounded bg-neutral-200" />
          <div className="h-32 animate-pulse rounded-xl bg-neutral-200" />
        </div>
        <CaptainMapSkeleton />
      </div>
    ),
    ssr: false,
  },
);

export default function ActiveRidePageClient() {
  return <ActiveRideLayout />;
}
