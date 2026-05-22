"use client";

import { useState } from "react";

import LocationInputGroup from "@/components/rider/shared/location-input-group";
import PassengerSelector from "@/components/rider/shared/passenger-selector";
import PromoBanner from "@/components/rider/shared/promo-banner";
import ScheduleSelector from "@/components/rider/shared/schedule-selector";
import ServiceSegmentControl, {
  RENTAL_MODES,
  type RentalServiceMode,
} from "@/components/rider/shared/service-segment-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RentalsSidebarPanelProps = {
  showSearchButton?: boolean;
  onSearch?: () => void;
};

export default function RentalsSidebarPanel({
  showSearchButton = false,
  onSearch,
}: RentalsSidebarPanelProps) {
  const [serviceMode, setServiceMode] = useState<RentalServiceMode>("hourly");

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-neutral-900">
        Find a rental
      </h1>

      <div className="mt-5">
        <PromoBanner message="15% off hourly rentals. Up to ₹500 off" />
      </div>

      <div className="mt-4">
        <ServiceSegmentControl
          value={serviceMode}
          onChange={setServiceMode}
          modes={RENTAL_MODES}
          ariaLabel="Rental service type"
        />
      </div>

      <div className="mt-4">
        <LocationInputGroup showLocationIcons showAddStop />
      </div>

      <div className="mt-3 space-y-2">
        <ScheduleSelector />
        <PassengerSelector />
      </div>

      {showSearchButton && (
        <Button
          onClick={onSearch}
          className={cn(
            "mt-auto h-12 w-full rounded-lg text-base font-semibold",
            "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          Search
        </Button>
      )}
    </div>
  );
}
