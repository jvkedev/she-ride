"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import PaymentRequestBar from "@/components/rider/booking/payment-request-bar";
import RideOptionsList from "@/components/rider/booking/ride-options-list";
import TripForm from "@/components/rider/booking/trip-form";
import { cn } from "@/lib/utils";
import { getRoute } from "@/services/socket/socket.service";
import { RideEstimate } from "@/services/rides/rides.service";
import { LocationSuggestion } from "@/services/location/location.service";
const VEHICLE_TYPE_MAP: Record<string, string> = {
  "She Go": "CAR",
  "She Auto": "AUTO",
  "She Bike Saver": "BIKE",
  "She SUV": "SUV",
};

const MapPanelSection = dynamic(
  () => import("@/components/rider/booking/map-panel-section"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full animate-pulse rounded-2xl bg-neutral-200" />
    ),
  },
);

const RideLiveMap = dynamic(
  () => import("@/components/rider/booking/ride-live-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full animate-pulse rounded-2xl bg-neutral-200" />
    ),
  },
);

type BookingStep = "search" | "rides" | "tracking";

export default function BookingLayout() {
  const [step, setStep] = useState<BookingStep>("search");
  const [selectedRide, setSelectedRide] = useState("She Go");
  const [estimates, setEstimates] = useState<RideEstimate[]>([]);
  const [pickup, setPickup] = useState<LocationSuggestion | null>(null);
  const [drop, setDrop] = useState<LocationSuggestion | null>(null);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);

  function handleSearch(
    results: RideEstimate[],
    p: LocationSuggestion,
    d: LocationSuggestion,
  ) {
    setEstimates(results);
    setPickup(p);
    setDrop(d);
    setStep("rides");
  }

  function handleRideRequested(rideId: string) {
    setActiveRideId(rideId);
    setStep("tracking");
  }

  useEffect(() => {
    let cancelled = false;

    async function loadRoute() {
      if (!pickup || !drop) {
        setRoute([]);
        return;
      }

      const routeData = await getRoute(
        pickup.lat,
        pickup.lng,
        drop.lat,
        drop.lng,
      );

      if (!cancelled) {
        setRoute(routeData);
      }
    }

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [pickup, drop]);

  const selectedEstimate = estimates.find((e) => {
    const map: Record<string, string> = {
      CAR: "She Go",
      AUTO: "She Auto",
      BIKE: "She Bike Saver",
      SUV: "She SUV",
    };
    return map[e.vehicleType] === selectedRide;
  });

  const rideOptions = (
    <RideOptionsList
      selected={selectedRide}
      onSelect={setSelectedRide}
      estimates={estimates}
    />
  );

  const paymentBar = (className?: string) => (
    <PaymentRequestBar
      selectedRide={selectedRide}
      estimate={selectedEstimate}
      pickup={pickup}
      drop={drop}
      onRideRequested={handleRideRequested}
      className={className}
    />
  );

  // Map panel — shows captain live location after ride is requested
  const nearbyCaptains = selectedEstimate?.nearbyCaptains ?? 0;

  const mapPanel = (
    <div className="h-full min-h-0">
      {activeRideId ? (
        <RideLiveMap
          rideId={activeRideId}
          pickupLat={pickup?.lat}
          pickupLng={pickup?.lng}
          vehicleType={VEHICLE_TYPE_MAP[selectedRide]}
        />
      ) : (
        <MapPanelSection
          pickup={pickup ? [pickup.lat, pickup.lng] : undefined}
          drop={drop ? [drop.lat, drop.lng] : undefined}
          route={route}
          nearbyCaptains={nearbyCaptains}
        />
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "grid h-full min-h-0 overflow-hidden bg-[#f6f6f6]",
        step === "rides"
          ? "grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,400px)_1fr]"
          : "grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr]",
      )}
    >
      <aside className="rider-panel-scroll min-h-0 overflow-y-auto border-neutral-200 bg-white lg:border-r">
        <TripForm
          showSearchButton={step === "search"}
          onSearch={handleSearch}
        />
      </aside>

      {step === "rides" && (
        <section className="relative hidden min-h-0 flex-col border-neutral-200 bg-white lg:flex lg:border-r">
          <div className="rider-panel-scroll min-h-0 flex-1 overflow-y-auto px-6 pt-8 pb-28">
            {rideOptions}
          </div>
          {paymentBar()}
        </section>
      )}

      <div className="relative hidden min-h-0 p-4 lg:block lg:p-5">
        {mapPanel}
      </div>

      {step === "rides" && (
        <div className="flex shrink-0 flex-col border-t border-neutral-200 bg-white lg:hidden">
          <div className="rider-panel-scroll max-h-[45dvh] overflow-y-auto px-4 pt-6 pb-28">
            {rideOptions}
          </div>
          {paymentBar(
            "fixed inset-x-0 bottom-16 z-40 border-t bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]",
          )}
        </div>
      )}

      {step === "search" && (
        <div className="shrink-0 border-t border-neutral-200 p-4 lg:hidden">
          <div className="h-56 min-h-56 overflow-hidden rounded-2xl">
            <MapPanelSection
              pickup={pickup ? [pickup.lat, pickup.lng] : undefined}
              drop={drop ? [drop.lat, drop.lng] : undefined}
              route={route}
              nearbyCaptains={nearbyCaptains}
            />
          </div>
        </div>
      )}

      {step === "tracking" && (
        <div className="shrink-0 border-t border-neutral-200 p-4 lg:hidden">
          <div className="h-56 min-h-56 overflow-hidden rounded-2xl">
            {activeRideId && (
              <RideLiveMap
                rideId={activeRideId}
                pickupLat={pickup?.lat}
                pickupLng={pickup?.lng}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
