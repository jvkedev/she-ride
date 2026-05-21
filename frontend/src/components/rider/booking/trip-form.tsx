"use client";

import LocationInputGroup from "@/components/rider/shared/location-input-group";
import PassengerSelector from "@/components/rider/shared/passenger-selector";
import PromoBanner from "@/components/rider/shared/promo-banner";
import ScheduleSelector from "@/components/rider/shared/schedule-selector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TripFormProps = {
  showSearchButton?: boolean;
  onSearch?: () => void;
  /** Minimal layout for rentals — no promo, schedule, or input icons */
  minimal?: boolean;
};

export default function TripForm({
  showSearchButton = false,
  onSearch,
  minimal = false,
}: TripFormProps) {
  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="text-[1.75rem] font-semibold tracking-tight text-neutral-900">
        Find a trip
      </h1>

      {!minimal && (
        <div className="mt-5">
          <PromoBanner />
        </div>
      )}

      <div className={cn(minimal ? "mt-6" : "mt-4")}>
        <LocationInputGroup
          showLocationIcons={!minimal}
          showAddStop={!minimal}
        />
      </div>

      {!minimal && (
        <div className="mt-3 space-y-2">
          <ScheduleSelector />
          <PassengerSelector />
        </div>
      )}

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
