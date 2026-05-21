import { Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LocationInputGroupProps = {
  pickup?: string;
  dropoff?: string;
  pickupPlaceholder?: string;
  dropoffPlaceholder?: string;
  showLocationIcons?: boolean;
  showAddStop?: boolean;
};

export default function LocationInputGroup({
  pickup = "ITL Twin Tower",
  dropoff = "Century Public School",
  pickupPlaceholder = "Pickup location",
  dropoffPlaceholder = "Drop location",
  showLocationIcons = true,
  showAddStop = true,
}: LocationInputGroupProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        {showLocationIcons && (
          <span className="absolute left-4 top-1/2 z-10 size-2 -translate-y-1/2 rounded-full bg-neutral-900" />
        )}
        <Input
          className={cn(
            "h-12 rounded-lg border-0 bg-[#eeeeee] text-[15px] text-neutral-900 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-300",
            showLocationIcons ? "pl-10" : "pl-4",
          )}
          defaultValue={pickup}
          placeholder={pickupPlaceholder}
        />
      </div>

      <div className="relative">
        {showLocationIcons && (
          <span className="absolute left-4 top-1/2 z-10 size-2 -translate-y-1/2 bg-neutral-900" />
        )}
        <Input
          className={cn(
            "h-12 rounded-lg border-0 bg-[#eeeeee] text-[15px] text-neutral-900 shadow-none focus-visible:ring-1 focus-visible:ring-neutral-300",
            showLocationIcons ? "pl-10 pr-12" : "pl-4",
            showAddStop && "pr-12",
          )}
          defaultValue={dropoff}
          placeholder={dropoffPlaceholder}
        />
        {showAddStop && (
          <button
            type="button"
            aria-label="Add stop"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-900"
          >
            <Plus className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
