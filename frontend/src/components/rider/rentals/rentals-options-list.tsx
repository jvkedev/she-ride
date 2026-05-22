"use client";

import RideOptionCard from "@/components/rider/booking/ride-option-card";

const rentalOptions = [
  {
    id: "She Rental",
    name: "She Rental",
    seats: 4,
    eta: "Driver in 15 min",
    price: "₹2,200.00",
    image: "/images/vehicles/four_seater.png",
  },
  {
    id: "She Rental Auto",
    name: "She Rental Auto",
    seats: 4,
    eta: "Auto · 20 min",
    price: "₹1,500.00",
    image: "/images/vehicles/auto.png",
  },
  {
    id: "She XL Rental",
    name: "She XL Rental",
    seats: 6,
    eta: "Spacious van · 25 min",
    price: "₹2,500.00",
    image: "/images/vehicles/six_seater.png",
  },
];

type RentalsOptionsListProps = {
  selected: string;
  onSelect: (id: string) => void;
};

export default function RentalsOptionsList({
  selected,
  onSelect,
}: RentalsOptionsListProps) {
  return (
    <div className="mt-6 space-y-3">
      {rentalOptions.map((option) => (
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
