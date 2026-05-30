"use client";

import { ChevronDown, CreditCard, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getDefaultPaymentMethod,
  type PaymentMethod,
} from "@/services/rider/payments.service";
import { RideEstimate, requestRide } from "@/services/rides/rides.service";
import { LocationSuggestion } from "@/services/location/location.service";

const VEHICLE_TYPE_MAP: Record<string, "CAR" | "AUTO" | "BIKE" | "SUV"> = {
  "She Go": "CAR",
  "She Auto": "AUTO",
  "She Bike Saver": "BIKE",
  "She SUV": "SUV",
};

const METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CARD: "Card",
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
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDefaultPaymentMethod()
      .then((r) => setMethod(r.method))
      .catch(() => setMethod("CASH"));
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

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
        paymentMethod: method,
      });
      onRideRequested?.(ride.rideId);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to request ride.";
      setError(message);
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
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-12 w-full items-center justify-between rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            <span className="flex items-center gap-2">
              <CreditCard className="size-5 text-[#2e7d32]" />
              {METHOD_LABEL[method]}
            </span>
            <ChevronDown className="size-4 text-neutral-500" />
          </button>
          {menuOpen && (
            <ul className="absolute bottom-full left-0 z-50 mb-1 w-full rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
              {(["CASH", "UPI", "CARD"] as PaymentMethod[]).map((m) => (
                <li key={m}>
                  <button
                    type="button"
                    className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50"
                    onClick={() => {
                      setMethod(m);
                      setMenuOpen(false);
                    }}
                  >
                    {METHOD_LABEL[m]}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button
          onClick={() => void handleRequest()}
          disabled={loading || !pickup || !drop || !estimate}
          className="h-12 rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Requesting...
            </>
          ) : (
            `Request ${selectedRide}`
          )}
        </Button>
      </div>
    </div>
  );
}
