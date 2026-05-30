"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import PaymentRequestBar from "@/components/rider/booking/payment-request-bar";
import RideOptionsList from "@/components/rider/booking/ride-options-list";
import TripForm from "@/components/rider/booking/trip-form";
import FindingRideSheet from "@/components/rider/booking/finding-ride-sheet";
import { useTripRoute } from "@/hooks/routing/use-trip-route";
import { prefetchRoute } from "@/services/routing/routing.service";
import { cn } from "@/lib/utils";
import { RideEstimate } from "@/services/rides/rides.service";
import { LocationSuggestion } from "@/services/location/location.service";
import { normalizeLatLng } from "@/lib/maps/map-camera";
import type { CaptainInfo } from "@/lib/ride/captain-types";

function toMapPoint(
  loc: LocationSuggestion | null,
): [number, number] | undefined {
  return normalizeLatLng(loc ? [loc.lat, loc.lng] : null) ?? undefined;
}

function toCoords(
  loc: LocationSuggestion | null,
): { lat: number; lng: number } | null {
  const pt = normalizeLatLng(loc ? [loc.lat, loc.lng] : null);
  if (!pt) return null;
  return { lat: pt[0], lng: pt[1] };
}

const VEHICLE_TYPE_MAP: Record<string, string> = {
  "She Go": "CAR",
  "She Auto": "AUTO",
  "She Bike Saver": "BIKE",
  "She SUV": "SUV",
};

const MapPanelSection = dynamic(
  () => import("@/components/rider/booking/map-panel-section"),
  { ssr: false },
);

const RideLiveMap = dynamic(
  () => import("@/components/rider/booking/ride-live-map"),
  { ssr: false },
);

type BookingStep = "search" | "rides" | "tracking";

export default function BookingLayout() {
  const router = useRouter();
  const [step, setStep] = useState<BookingStep>("search");
  const [selectedRide, setSelectedRide] = useState("She Go");
  const [estimates, setEstimates] = useState<RideEstimate[]>([]);
  const [pickup, setPickup] = useState<LocationSuggestion | null>(null);
  const [drop, setDrop] = useState<LocationSuggestion | null>(null);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);
  const [rideStatus, setRideStatus] = useState<string>("SEARCHING");
  const [captain, setCaptain] = useState<CaptainInfo | null>(null);
  const [findingLabel, setFindingLabel] = useState<string | null>(null);

  const pickupCoords = useMemo(() => toCoords(pickup), [pickup]);
  const dropCoords = useMemo(() => toCoords(drop), [drop]);

  const { route, distanceKm, durationMin, isPreview } = useTripRoute(
    pickupCoords,
    dropCoords,
  );

  function handleDropChange(location: LocationSuggestion) {
    setDrop(location);
    const p = toCoords(pickup);
    const d = toCoords(location);
    if (p && d) {
      prefetchRoute(p.lat, p.lng, d.lat, d.lng);
    }
  }

  function handleSearch(
    results: RideEstimate[],
    p: LocationSuggestion,
    d: LocationSuggestion,
  ) {
    setEstimates(results);
    setPickup(p);
    setDrop(d);
    const pickupPt = toCoords(p);
    const dropPt = toCoords(d);
    if (pickupPt && dropPt) {
      prefetchRoute(pickupPt.lat, pickupPt.lng, dropPt.lat, dropPt.lng);
    }
    setStep("rides");
  }

  function handleRideRequested(rideId: string) {
    setActiveRideId(rideId);
    setRideStatus("SEARCHING");
    setCaptain(null);
    setFindingLabel("Finding your ride…");
    setStep("tracking");
  }

  function handleRideCanceled() {
    setActiveRideId(null);
    setCaptain(null);
    setRideStatus("SEARCHING");
    setFindingLabel(null);
    setStep("rides");
  }

  function handleRideCompleted() {
    setActiveRideId(null);
    setCaptain(null);
    setFindingLabel(null);
    router.push("/rider/history");
  }

  const selectedEstimate = estimates.find((e) => {
    const map: Record<string, string> = {
      CAR: "She Go",
      AUTO: "She Auto",
      BIKE: "She Bike Saver",
      SUV: "She SUV",
    };
    return map[e.vehicleType] === selectedRide;
  });

  const nearbyCaptains = selectedEstimate?.nearbyCaptains ?? 0;

  const mapPanel = (
    <div className="relative h-full min-h-0">
      {activeRideId ? (
        <>
          <RideLiveMap
            rideId={activeRideId}
            pickupLat={pickup?.lat}
            pickupLng={pickup?.lng}
            dropLat={drop?.lat}
            dropLng={drop?.lng}
            tripRoute={route}
            vehicleType={VEHICLE_TYPE_MAP[selectedRide]}
          />
          <FindingRideSheet
            rideId={activeRideId}
            pickupLabel={pickup?.displayName}
            dropLabel={drop?.displayName}
            onCanceled={handleRideCanceled}
            onCompleted={handleRideCompleted}
            onCaptainUpdate={setCaptain}
            onRideStatusChange={(status) => {
              setRideStatus(status);
              if (status === "SEARCHING") {
                setFindingLabel("Finding your ride…");
              } else if (status === "ACCEPTED" || status === "ARRIVING") {
                setFindingLabel(null);
              }
            }}
          />
        </>
      ) : (
        <MapPanelSection
          pickup={toMapPoint(pickup)}
          drop={toMapPoint(drop)}
          route={route}
          routeIsPreview={isPreview}
          nearbyCaptains={nearbyCaptains}
          routeDistanceKm={distanceKm}
          routeDurationMin={durationMin}
        />
      )}
    </div>
  );

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
          pickup={pickup}
          drop={drop}
          onPickupChange={setPickup}
          onDropChange={handleDropChange}
          onSearch={handleSearch}
          isTracking={step === "tracking"}
          rideStatus={rideStatus}
          captain={captain}
          findingLabel={findingLabel ?? undefined}
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
              pickup={toMapPoint(pickup)}
              drop={toMapPoint(drop)}
              route={route}
              routeIsPreview={isPreview}
              nearbyCaptains={nearbyCaptains}
              routeDistanceKm={distanceKm}
              routeDurationMin={durationMin}
            />
          </div>
        </div>
      )}

      {step === "tracking" && (
        <div className="relative shrink-0 border-t border-neutral-200 p-4 lg:hidden">
          <div className="h-[min(56dvh,420px)] min-h-56 overflow-hidden rounded-2xl">
            {mapPanel}
          </div>
        </div>
      )}
    </div>
  );
}
