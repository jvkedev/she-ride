"use client";

import { cn } from "@/lib/utils";

export type ParcelServiceMode = "send" | "receive" | "shop";

const PARCEL_MODES: { id: ParcelServiceMode; label: string }[] = [
  { id: "send", label: "Send" },
  { id: "receive", label: "Receive" },
  { id: "shop", label: "Shop pick-up" },
];

export type RentalServiceMode = "hourly" | "daily" | "multistop";

const RENTAL_MODES: { id: RentalServiceMode; label: string }[] = [
  { id: "hourly", label: "Hourly" },
  { id: "daily", label: "Full day" },
  { id: "multistop", label: "Multi-stop" },
];

type SegmentOption = { id: string; label: string };

type ServiceSegmentControlProps<T extends string = string> = {
  value: T;
  onChange: (mode: T) => void;
  modes?: SegmentOption[];
  ariaLabel?: string;
  className?: string;
};

export default function ServiceSegmentControl<T extends string = string>({
  value,
  onChange,
  modes = PARCEL_MODES as SegmentOption[],
  ariaLabel = "Service type",
  className,
}: ServiceSegmentControlProps<T>) {
  return (
    <div
      className={cn(
        "grid gap-1 rounded-lg bg-[#eeeeee] p-1",
        modes.length === 2 && "grid-cols-2",
        modes.length >= 3 && "grid-cols-3",
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {modes.map((mode) => {
        const isActive = value === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(mode.id as T)}
            className={cn(
              "rounded-md px-2 py-2.5 text-center text-sm font-medium transition",
              isActive
                ? "border border-neutral-900 bg-white text-neutral-900 shadow-sm"
                : "border border-transparent text-neutral-600 hover:text-neutral-900",
            )}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

export { PARCEL_MODES, RENTAL_MODES };
