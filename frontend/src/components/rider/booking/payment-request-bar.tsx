"use client";
import { ChevronDown, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { RideEstimate, requestRide } from "@/services/rides/rides.service";
import { LocationSuggestion } from "@/services/location/location.service";

const VEHICLE_TYPE_MAP: Record<string, "CAR" | "AUTO" | "BIKE" | "SUV"> = {
  "She Go": "CAR",
  "She Auto": "AUTO",
  "She Bike Saver": "BIKE",
  "She SUV": "SUV",
};

type PaymentRequestBarProps = {
  selectedRide?: string;
  estimate?: RideEstimate;
  pickup?: LocationSuggestion | null;
  drop?: LocationSuggestion | null;
  onRideRequested?: (rideId: string) => void;
  className?: string;
};

export default function PaymentRequestBar({
  selectedRide = "She Go",
  estimate,
  pickup,
  drop,
  onRideRequested,
  className,
}: PaymentRequestBarProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest() {
    if (!pickup || !drop || !estimate) return;

    const vehicleType = VEHICLE_TYPE_MAP[selectedRide];
    if (!vehicleType) return;

    setLoading(true);
    setError(null);

    try {
      const ride = await requestRide({
        pickupAddress: pickup.displayName,
        dropAddress: drop.displayName,
        pickupLatitude: pickup.lat,
        pickupLongitude: pickup.lng,
        dropLatitude: drop.lat,
        dropLongitude: drop.lng,
        vehicleType,
        paymentMethod: "CASH",
      });
      console.log("Ride created:", ride.rideId);
      onRideRequested?.(ride.rideId);
    } catch (err: any) {
      console.error("Request failed:", err);
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to request ride.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 border-t border-neutral-200 bg-white px-6 py-4",
        className,
      )}
    >
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      <div className="grid grid-cols-[1fr_1.4fr] gap-3">
        <button
          type="button"
          className="flex h-12 items-center justify-between rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
        >
          <span className="flex items-center gap-2">
            <CreditCard className="size-5 text-[#2e7d32]" />
            Cash
          </span>
          <ChevronDown className="size-4 text-neutral-500" />
        </button>

        <Button
          onClick={handleRequest}
          disabled={loading || !pickup || !drop || !estimate}
          className="h-12 rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Requesting..." : `Request ${selectedRide}`}
        </Button>
      </div>
    </div>
  );
}
