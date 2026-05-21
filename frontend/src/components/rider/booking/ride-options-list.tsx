"use client";

import RideOptionCard from "./ride-option-card";

const rides = [
  {
    id: "She Go",
    name: "She Go",
    seats: 4,
    eta: "2 mins away • 17:00",
    price: "₹501.95",
    image: "/images/vehicles/four_seater.png",
  },
  {
    id: "She Auto",
    name: "She Auto",
    seats: 3,
    eta: "3 mins away • 17:01",
    price: "₹340.78",
    oldPrice: "₹380.00",
    image: "/images/vehicles/auto.png",
  },
  {
    id: "She Bike Saver",
    name: "She Bike Saver",
    seats: 1,
    eta: "2 mins away • 17:00",
    price: "₹245.89",
    image: "/images/vehicles/bike.png",
    badge: "Saver",
  },
] as const;

type RideOptionsListProps = {
  selected: string;
  onSelect: (id: string) => void;
};

export default function RideOptionsList({
  selected,
  onSelect,
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
        {rides.map((ride) => (
          <RideOptionCard
            key={ride.id}
            {...ride}
            active={selected === ride.id}
            onSelect={() => onSelect(ride.id)}
          />
        ))}
      </div>
    </div>
  );
}
