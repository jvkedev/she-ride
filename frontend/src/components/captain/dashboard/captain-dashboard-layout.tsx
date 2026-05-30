"use client";

import CaptainActivityPanel from "@/components/captain/dashboard/captain-activity-panel";
import CaptainCurrentRide from "@/components/captain/dashboard/captain-current-ride";
import CaptainEarningsCard from "@/components/captain/dashboard/captain-earnings-card";
import CaptainMapPanel from "@/components/captain/dashboard/captain-map-panel";
import CaptainProfilePanel from "@/components/captain/dashboard/captain-profile-panel";
import CaptainStatsCards from "@/components/captain/dashboard/captain-stats-cards";
import RequestList from "@/components/captain/requests/request-list";
import EmergencySosCard from "@/components/captain/safety/emergency-sos-card";
import {
  captainHeading,
  captainPanelScroll,
} from "@/lib/captain/captain-styles";
import { useCaptainStore } from "@/store/captain.store";

export default function CaptainDashboardLayout() {
  const { activeRideId, setActiveRideId } = useCaptainStore();

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] overflow-hidden lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
      <div
        className={`${captainPanelScroll} min-h-0 overflow-y-auto border-neutral-200 p-4 lg:border-r lg:p-5`}
      >
        <CaptainStatsCards />
        <div className="mt-4">
          <CaptainProfilePanel />
        </div>
        <CaptainEarningsCard />
        <section className="mt-4">
          <h2 className={`${captainHeading} mb-3`}>Incoming requests</h2>
          <RequestList onRideAccepted={setActiveRideId} />
        </section>
        <div className="mt-4 space-y-4">
          <CaptainCurrentRide />
          <EmergencySosCard compact />
          <CaptainActivityPanel />
        </div>
      </div>

      <div className="relative hidden min-h-0 lg:block">
        <div className="absolute inset-0 p-4 lg:p-5">
          <CaptainMapPanel
            className="h-full min-h-0"
            rideId={activeRideId ?? undefined}
            overlay={
              <div className="pointer-events-auto ml-auto w-fit rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm backdrop-blur-sm">
                Live GPS tracking
              </div>
            }
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-neutral-200 p-4 lg:hidden">
        <h2 className={`${captainHeading} mb-3`}>Live map</h2>
        <CaptainMapPanel
          className="h-56 min-h-56"
          rideId={activeRideId ?? undefined}
        />
      </div>
    </div>
  );
}
