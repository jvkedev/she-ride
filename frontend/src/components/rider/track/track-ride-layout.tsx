"use client";

import dynamic from "next/dynamic";

import TrackRidePanel from "@/components/rider/track/track-ride-panel";
import type { RiderActiveRide } from "@/services/rides/rides.service";
import { cn } from "@/lib/utils";

const RideLiveMap = dynamic(
  () => import("@/components/rider/booking/ride-live-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[320px] animate-pulse rounded-2xl bg-neutral-200" />
    ),
  },
);

type TrackRideLayoutProps = {
  ride: RiderActiveRide;
  etaMinutes?: number | null;
};

export default function TrackRideLayout({
  ride,
  etaMinutes,
}: TrackRideLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden bg-[#f6f6f6]",
        "lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]",
      )}
    >
      <aside className="rider-panel-scroll min-h-0 flex-1 overflow-y-auto border-neutral-200 bg-white lg:flex-none lg:border-r">
        <TrackRidePanel ride={ride} etaMinutes={etaMinutes} />
      </aside>

      <div className="relative hidden min-h-0 lg:block">
        <div className="absolute inset-0 p-4 lg:p-5">
          <RideLiveMap
            rideId={ride.rideId}
            pickupLat={ride.pickupLatitude}
            pickupLng={ride.pickupLongitude}
            dropLat={ride.dropLatitude}
            dropLng={ride.dropLongitude}
            vehicleType={ride.vehicleType}
            initialStatus={ride.status}
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-neutral-200 bg-white p-4 lg:hidden">
        <div className="h-56 min-h-56 overflow-hidden rounded-2xl border border-neutral-200">
          <div className="h-full min-h-56 rounded-2xl overflow-hidden">
            <RideLiveMap
              rideId={ride.rideId}
              pickupLat={ride.pickupLatitude}
              pickupLng={ride.pickupLongitude}
              dropLat={ride.dropLatitude}
              dropLng={ride.dropLongitude}
              vehicleType={ride.vehicleType}
              initialStatus={ride.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
