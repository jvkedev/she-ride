"use client";

import BookingSidebarCard from "@/components/rider/shared/booking-sidebar-card";
import { Button } from "@/components/ui/button";
import RentalFeatureItem from "./rental-feature-item";
import RentalsIllustration from "./rentals-illustration";

type RentalsIntroPanelProps = {
  onGetStarted: () => void;
};

export default function RentalsIntroPanel({
  onGetStarted,
}: RentalsIntroPanelProps) {
  return (
    <BookingSidebarCard className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden p-0">
      <RentalsIllustration />

      <div className="rider-panel-scroll min-h-0 flex-1">
        <div className="flex flex-col p-6">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-neutral-900">
          She Ride Rentals
        </h1>

        <div className="mt-4 flex-1">
          <RentalFeatureItem>
            Keep a car and driver for up to 12 hours
          </RentalFeatureItem>
          <RentalFeatureItem>
            Ideal for business meetings, tourist travel and multiple stop trips
          </RentalFeatureItem>
          <RentalFeatureItem>
            Book for now or reserve for later
          </RentalFeatureItem>
        </div>

        <Button
          onClick={onGetStarted}
          className="mt-6 h-12 w-full rounded-lg bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Get started
        </Button>
        </div>
      </div>
    </BookingSidebarCard>
  );
}
