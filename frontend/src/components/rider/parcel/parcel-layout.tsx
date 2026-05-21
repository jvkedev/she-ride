"use client";

import { useState } from "react";

import ParcelOptionsPanel from "@/components/rider/parcel/parcel-options-panel";
import ParcelPaymentBar from "@/components/rider/parcel/parcel-payment-bar";
import ParcelSidebarPanel from "@/components/rider/parcel/parcel-sidebar-panel";
import RiderMapPanel from "@/components/rider/shared/rider-map-panel";
import { cn } from "@/lib/utils";

type ParcelStep = "form" | "options";

export default function ParcelLayout() {
  const [step, setStep] = useState<ParcelStep>("form");
  const [selectedOption, setSelectedOption] = useState("She Courier");

  return (
    <div
      className={cn(
        "grid h-[calc(100dvh-4rem)] bg-[#f6f6f6]",
        step === "options"
          ? "grid-cols-1 lg:grid-cols-[minmax(340px,380px)_minmax(360px,440px)_1fr]"
          : "grid-cols-1 lg:grid-cols-[minmax(340px,400px)_1fr]",
      )}
    >
      <aside className="relative z-20 flex h-full min-h-0 flex-col p-4 lg:p-6">
        <ParcelSidebarPanel
          compact={step === "options"}
          showSearchButton={step === "form"}
          onSearch={() => setStep("options")}
        />
      </aside>

      {step === "options" && (
        <section className="relative hidden min-h-0 flex-col border-neutral-200 bg-white lg:flex lg:border-r">
          <div className="min-h-0 flex-1 overflow-y-auto pb-28">
            <ParcelOptionsPanel
              selected={selectedOption}
              onSelect={setSelectedOption}
            />
          </div>
          <ParcelPaymentBar selectedOption={selectedOption} />
        </section>
      )}

      <div className="relative min-h-[280px] p-4 lg:min-h-0 lg:p-6">
        <RiderMapPanel showRouteLabels />
      </div>

      {step === "options" && (
        <div className="flex flex-col border-t border-neutral-200 bg-white lg:hidden">
          <div className="max-h-[50dvh] overflow-y-auto px-4 pt-6 pb-28">
            <ParcelOptionsPanel
              selected={selectedOption}
              onSelect={setSelectedOption}
            />
          </div>
          <ParcelPaymentBar
            selectedOption={selectedOption}
            className="fixed inset-x-0 bottom-0 z-40 border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          />
        </div>
      )}
    </div>
  );
}
