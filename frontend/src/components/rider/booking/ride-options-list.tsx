"use client";
import RideOptionCard from "./ride-option-card";
import { RideEstimate } from "@/services/rides/rides.service";

const RIDE_META = {
  CAR: {
    id: "She Go",
    name: "She Go",
    seats: 4,
    image: "/images/vehicles/four_seater.png",
  },
  AUTO: {
    id: "She Auto",
    name: "She Auto",
    seats: 3,
    image: "/images/vehicles/auto.png",
  },
  BIKE: {
    id: "She Bike Saver",
    name: "She Bike Saver",
    seats: 1,
    image: "/images/vehicles/bike.png",
    badge: "Saver",
  },
  SUV: {
    id: "She SUV",
    name: "She SUV",
    seats: 6,
    image: "/images/vehicles/four_seater.png",
  },
} as const;

type RideOptionsListProps = {
  selected: string;
  onSelect: (id: string) => void;
  estimates: RideEstimate[];
};

export default function RideOptionsList({
  selected,
  onSelect,
  estimates,
}: RideOptionsListProps) {
  return (
    <div>
      <h2 className="text-[1.75rem] font-semibold tracking-tight text-neutral-900">
        Choose a ride
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Rides we think you&apos;ll like
      </p>
      <div className="mt-6 space-y-3">
        {estimates.map((estimate) => {
          const meta =
            RIDE_META[estimate.vehicleType as keyof typeof RIDE_META];
          if (!meta) return null;

          return (
            <RideOptionCard
              key={meta.id}
              {...meta}
              eta={
                estimate.nearbyCaptains > 0
                  ? `${estimate.nearbyCaptains} captains nearby`
                  : "No captains nearby"
              }
              price={`₹${estimate.estimatedFare}`}
              active={selected === meta.id}
              onSelect={() => onSelect(meta.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
