"use client";

import RideControls from "@/components/captain/active-ride/ride-controls";
import RideMapPanel from "@/components/captain/active-ride/ride-map-panel";
import TripProgress from "@/components/captain/active-ride/trip-progress";
import CaptainCard from "@/components/captain/shared/captain-card";
import CaptainStatusBadge from "@/components/captain/shared/captain-status-badge";
import { activeRide } from "@/lib/captain/captain-mock-data";
import {
  captainHeading,
  captainMutedText,
  captainPanelScroll,
} from "@/lib/captain/captain-styles";

export default function ActiveRideLayout() {
  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] overflow-hidden lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
      <div
        className={`${captainPanelScroll} min-h-0 overflow-y-auto p-4 lg:border-r lg:p-5`}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-900">Active ride</h1>
          <CaptainStatusBadge status="busy" />
        </div>

        <CaptainCard className="mt-4">
          <p className={captainMutedText}>Passenger</p>
          <p className="text-lg font-semibold text-neutral-900">
            {activeRide.passengerName}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-widest text-primary">
            {activeRide.otp}
          </p>
          <p className={captainMutedText}>Share OTP at pickup</p>
        </CaptainCard>

        <CaptainCard className="mt-4">
          <h2 className={captainHeading}>Trip progress</h2>
          <div className="mt-4">
            <TripProgress currentStep="trip" />
          </div>
        </CaptainCard>

        <div className="mt-4">
          <RideControls />
        </div>
      </div>

      <div className="relative hidden min-h-0 lg:block">
        <div className="absolute inset-0 p-4 lg:p-5">
          <RideMapPanel />
        </div>
      </div>

      <div className="shrink-0 border-t border-neutral-200 p-4 lg:hidden">
        <RideMapPanel />
      </div>
    </div>
  );
}
