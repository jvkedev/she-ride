"use client";

import { useState } from "react";

import BookingSidebarCard from "@/components/rider/shared/booking-sidebar-card";
import LocationInputGroup from "@/components/rider/shared/location-input-group";
import ServiceSegmentControl, {
  RENTAL_MODES,
  type RentalServiceMode,
} from "@/components/rider/shared/service-segment-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import RentalsIllustration from "./rentals-illustration";

type RentalsSidebarPanelProps = {
  compact?: boolean;
  showSearchButton?: boolean;
  onSearch?: () => void;
};

export default function RentalsSidebarPanel({
  compact = false,
  showSearchButton = true,
  onSearch,
}: RentalsSidebarPanelProps) {
  const [serviceMode, setServiceMode] = useState<RentalServiceMode>("hourly");

  return (
    <BookingSidebarCard className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden p-0">
      {!compact && <RentalsIllustration />}

      <div className="rider-panel-scroll min-h-0 flex-1">
        <div className="flex flex-col p-6">
          <h1
            className={cn(
              "text-[1.75rem] font-semibold tracking-tight text-neutral-900",
              compact && "mt-0",
            )}
          >
            {compact ? "She Ride Rentals" : "Rentals"}
          </h1>

          {!compact && (
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Keep a car and driver for hours at a time. Ideal for business
              meetings, tourist travel, and trips with multiple stops.
            </p>
          )}

          <div className={cn("space-y-4", compact ? "mt-4" : "mt-6")}>
            <ServiceSegmentControl
              value={serviceMode}
              onChange={setServiceMode}
              modes={RENTAL_MODES}
              ariaLabel="Rental service type"
            />
            <LocationInputGroup
              showLocationIcons={false}
              showAddStop={false}
            />
          </div>

          {showSearchButton && (
            <Button
              onClick={onSearch}
              className="mt-6 h-12 w-full rounded-lg bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Search
            </Button>
          )}
        </div>
      </div>
    </BookingSidebarCard>
  );
}
