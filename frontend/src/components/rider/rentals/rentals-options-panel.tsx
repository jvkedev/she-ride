"use client";

import RentalsOptionsList from "./rentals-options-list";

type RentalsOptionsPanelProps = {
  selected: string;
  onSelect: (id: string) => void;
};

export default function RentalsOptionsPanel({
  selected,
  onSelect,
}: RentalsOptionsPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col px-6 pt-8">
      <h2 className="text-[1.75rem] font-semibold tracking-tight text-neutral-900">
        Choose an option
      </h2>
      <RentalsOptionsList selected={selected} onSelect={onSelect} />
    </div>
  );
}
