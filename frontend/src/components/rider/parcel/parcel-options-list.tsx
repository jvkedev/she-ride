"use client";

import RideOptionCard from "@/components/rider/booking/ride-option-card";

const parcelOptions = [
  {
    id: "She Courier",
    name: "She Courier",
    seats: 1,
    eta: "25 min delivery",
    price: "₹89.00",
    image: "/images/vehicles/bike.png",
  },
  {
    id: "She Courier Plus",
    name: "She Courier Plus",
    seats: 1,
    eta: "35 min delivery",
    price: "₹149.00",
    image: "/images/vehicles/auto.png",
  },
  {
    id: "She Van Delivery",
    name: "She Van Delivery",
    seats: 4,
    eta: "45 min delivery",
    price: "₹299.00",
    image: "/images/vehicles/four_seater.png",
  },
];

type ParcelOptionsListProps = {
  selected: string;
  onSelect: (id: string) => void;
  unavailable?: boolean;
};

export default function ParcelOptionsList({
  selected,
  onSelect,
  unavailable = false,
}: ParcelOptionsListProps) {
  if (unavailable) {
    return (
      <p className="mt-8 text-sm leading-relaxed text-neutral-600">
        Unfortunately, She Ride parcel delivery is currently unavailable in
        your area. Try again later or choose a different pickup location.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {parcelOptions.map((option) => (
        <RideOptionCard
          key={option.id}
          {...option}
          active={selected === option.id}
          onSelect={() => onSelect(option.id)}
        />
      ))}
    </div>
  );
}
