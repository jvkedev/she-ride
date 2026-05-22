"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import RentalsOptionsPanel from "@/components/rider/rentals/rentals-options-panel";
import RentalsPaymentBar from "@/components/rider/rentals/rentals-payment-bar";
import RentalsSidebarPanel from "@/components/rider/rentals/rentals-sidebar-panel";
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

type RentalsStep = "form" | "options";

export default function RentalsLayout() {
  const [step, setStep] = useState<RentalsStep>("form");
  const [selectedOption, setSelectedOption] = useState("She Rental");

  return (
    <div
      className={cn(
        "grid h-full min-h-0 overflow-hidden bg-[#f6f6f6]",
        step === "options"
          ? "grid-cols-1 lg:grid-cols-[minmax(0,380px)_minmax(0,400px)_1fr]"
          : "grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr]",
      )}
    >
      <aside className="rider-panel-scroll min-h-0 overflow-y-auto border-neutral-200 bg-white lg:border-r">
        <RentalsSidebarPanel
          showSearchButton={step === "form"}
          onSearch={() => setStep("options")}
        />
      </aside>

      {step === "options" && (
        <section className="relative hidden min-h-0 flex-col border-neutral-200 bg-white lg:flex lg:border-r">
          <div className="rider-panel-scroll min-h-0 flex-1 overflow-y-auto px-6 pt-8 pb-28">
            <RentalsOptionsPanel
              selected={selectedOption}
              onSelect={setSelectedOption}
            />
          </div>
          <RentalsPaymentBar selectedOption={selectedOption} />
        </section>
      )}

      <div className="relative hidden min-h-0 p-4 lg:block lg:p-5">
        <div className="h-full min-h-0">
          <MapPanelSection />
        </div>
      </div>

      {step === "options" && (
        <div className="flex shrink-0 flex-col border-t border-neutral-200 bg-white lg:hidden">
          <div className="rider-panel-scroll max-h-[45dvh] overflow-y-auto px-4 pt-6 pb-28">
            <RentalsOptionsPanel
              selected={selectedOption}
              onSelect={setSelectedOption}
            />
          </div>
          <RentalsPaymentBar
            selectedOption={selectedOption}
            className="fixed inset-x-0 bottom-16 z-40 border-t bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          />
        </div>
      )}

      {step === "form" && (
        <div className="shrink-0 border-t border-neutral-200 p-4 lg:hidden">
          <div className="h-56 min-h-56 overflow-hidden rounded-2xl">
            <MapPanelSection />
          </div>
        </div>
      )}
    </div>
  );
}
