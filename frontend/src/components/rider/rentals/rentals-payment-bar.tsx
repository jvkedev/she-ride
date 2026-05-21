"use client";

import { ChevronDown, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RentalsPaymentBarProps = {
  selectedOption?: string;
  className?: string;
};

export default function RentalsPaymentBar({
  selectedOption = "She Rental",
  className,
}: RentalsPaymentBarProps) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-neutral-200 bg-white px-6 py-4",
        className,
      )}
    >
      <div className="grid grid-cols-[1fr_1.4fr] gap-3">
        <button
          type="button"
          className="flex h-12 items-center justify-between rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
        >
          <span className="flex items-center gap-2">
            <CreditCard className="size-5 text-[#2e7d32]" />
            Cash
          </span>
          <ChevronDown className="size-4 text-neutral-500" />
        </button>

        <Button className="h-12 rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90">
          Request {selectedOption}
        </Button>
      </div>
    </div>
  );
}
