"use client";

import { useState } from "react";

import BookingSidebarCard from "@/components/rider/shared/booking-sidebar-card";
import LocationInputGroup from "@/components/rider/shared/location-input-group";
import ServiceSegmentControl, {
  PARCEL_MODES,
  type ParcelServiceMode,
} from "@/components/rider/shared/service-segment-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ParcelIllustration from "./parcel-illustration";

type ParcelSidebarPanelProps = {
  compact?: boolean;
  showSearchButton?: boolean;
  onSearch?: () => void;
};

export default function ParcelSidebarPanel({
  compact = false,
  showSearchButton = true,
  onSearch,
}: ParcelSidebarPanelProps) {
  const [serviceMode, setServiceMode] = useState<ParcelServiceMode>("send");

  return (
    <BookingSidebarCard className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden p-0">
      {!compact && <ParcelIllustration />}

      <div className="rider-panel-scroll min-h-0 flex-1">
        <div className="flex flex-col p-6">
        <h1
          className={cn(
            "text-[1.75rem] font-semibold tracking-tight text-neutral-900",
            compact && "mt-0",
          )}
        >
          {compact ? "She Package" : "Courier"}
        </h1>

        {!compact && (
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Have a courier deliver something for you. Get packages delivered in
            the time it takes to drive there.
          </p>
        )}

        <div className={cn("space-y-4", compact ? "mt-4" : "mt-6")}>
          <ServiceSegmentControl
            value={serviceMode}
            onChange={setServiceMode}
            modes={PARCEL_MODES}
            ariaLabel="Parcel service type"
          />
          <LocationInputGroup
            showLocationIcons={false}
            showAddStop={false}
          />
        </div>

        {showSearchButton && (
          <Button
            onClick={onSearch}
            className={cn(
              "mt-6 h-12 w-full rounded-lg text-base font-semibold",
              "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            Search
          </Button>
        )}
        </div>
      </div>
    </BookingSidebarCard>
  );
}
