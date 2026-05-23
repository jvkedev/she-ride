"use client";

import dynamic from "next/dynamic";

import BookingLoading from "@/components/rider/booking/booking-loading";
import { activeTrackRide } from "@/lib/rider/rider-mock-data";

const TrackRideLayout = dynamic(
  () => import("@/components/rider/track/track-ride-layout"),
  {
    loading: () => <BookingLoading />,
    ssr: false,
  },
);

export default function TrackPageClient() {
  const { pickup, dropoff } = activeTrackRide;

  return (
    <div className="h-full min-h-0 flex-1">
      <TrackRideLayout pickup={pickup} dropoff={dropoff} />
    </div>
  );
}
