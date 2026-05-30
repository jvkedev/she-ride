"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import CaptainCurrentRide from "@/components/captain/dashboard/captain-current-ride";
import CaptainMapPanel from "@/components/captain/dashboard/captain-map-panel";
import { getCaptainActiveRide } from "@/services/captain/captain-rides.service";
import { useCaptainStore } from "@/store/captain.store";

export default function ActiveRidePageClient() {
  const router = useRouter();
  const { activeRideId, setActiveRide, clearActiveRide } = useCaptainStore();

  useEffect(() => {
    if (activeRideId) return;

    getCaptainActiveRide()
      .then((active) => {
        if (!active) {
          router.replace("/captain");
          return;
        }
        setActiveRide({
          rideId: active.rideId,
          status: active.status,
          pickupLat: active.pickupLatitude,
          pickupLng: active.pickupLongitude,
          dropLat: active.dropLatitude,
          dropLng: active.dropLongitude,
          vehicleType: active.vehicleType,
          pickupAddress: active.pickupAddress,
          dropAddress: active.dropAddress,
        });
      })
      .catch(() => router.replace("/captain"));
  }, [activeRideId, router, setActiveRide]);

  useEffect(() => {
    if (!activeRideId) return;
    const interval = setInterval(() => {
      getCaptainActiveRide()
        .then((active) => {
          if (!active) {
            clearActiveRide();
            router.replace("/captain");
          }
        })
        .catch(() => {});
    }, 20000);
    return () => clearInterval(interval);
  }, [activeRideId, clearActiveRide, router]);

  if (!activeRideId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-neutral-500">
        Loading active ride…
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,400px)_1fr] lg:grid-rows-1">
      <div className="captain-panel-scroll min-h-0 overflow-y-auto border-neutral-200 p-4 lg:border-r lg:p-5">
        <CaptainCurrentRide />
      </div>
      <div className="relative hidden min-h-0 lg:block">
        <div className="absolute inset-0 p-4 lg:p-5">
          <CaptainMapPanel className="h-full min-h-0" rideId={activeRideId} />
        </div>
      </div>
      <div className="shrink-0 border-t border-neutral-200 p-4 lg:hidden">
        <CaptainMapPanel className="h-56 min-h-56" rideId={activeRideId} />
      </div>
    </div>
  );
}
