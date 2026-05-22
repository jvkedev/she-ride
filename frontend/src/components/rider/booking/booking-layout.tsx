"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import PaymentRequestBar from "@/components/rider/booking/payment-request-bar";
import RideOptionsList from "@/components/rider/booking/ride-options-list";
import TripForm from "@/components/rider/booking/trip-form";
import { cn } from "@/lib/utils";

const MapPanelSection = dynamic(
  () => import("@/components/rider/booking/map-panel-section"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full animate-pulse rounded-2xl bg-neutral-200" />
    ),
  },
);

type BookingStep = "search" | "rides";

export default function BookingLayout() {
  const [step, setStep] = useState<BookingStep>("search");
  const [selectedRide, setSelectedRide] = useState("She Go");

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
          onSearch={() => setStep("rides")}
        />
      </aside>

      {step === "rides" && (
        <section className="relative hidden min-h-0 flex-col border-neutral-200 bg-white lg:flex lg:border-r">
          <div className="rider-panel-scroll min-h-0 flex-1 overflow-y-auto px-6 pt-8 pb-28">
            <RideOptionsList
              selected={selectedRide}
              onSelect={setSelectedRide}
            />
          </div>
          <PaymentRequestBar selectedRide={selectedRide} />
        </section>
      )}

      <div className="relative hidden min-h-0 p-4 lg:block lg:p-5">
        <div className="h-full min-h-0">
          <MapPanelSection />
        </div>
      </div>

      {step === "rides" && (
        <div className="flex shrink-0 flex-col border-t border-neutral-200 bg-white lg:hidden">
          <div className="rider-panel-scroll max-h-[45dvh] overflow-y-auto px-4 pt-6 pb-28">
            <RideOptionsList
              selected={selectedRide}
              onSelect={setSelectedRide}
            />
          </div>
          <PaymentRequestBar
            selectedRide={selectedRide}
            className="fixed inset-x-0 bottom-16 z-40 border-t bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          />
        </div>
      )}

      {step === "search" && (
        <div className="shrink-0 border-t border-neutral-200 p-4 lg:hidden">
          <div className="h-56 min-h-56 overflow-hidden rounded-2xl">
            <MapPanelSection />
          </div>
        </div>
      )}
    </div>
  );
}
