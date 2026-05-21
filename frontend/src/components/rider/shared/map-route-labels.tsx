import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type MapRouteLabelsProps = {
  pickup: string;
  dropoff: string;
  className?: string;
};

export default function MapRouteLabels({
  pickup,
  dropoff,
  className,
}: MapRouteLabelsProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-[500]",
        className,
      )}
    >
      <div className="absolute top-[22%] left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-md">
        <span>From {pickup}</span>
        <ChevronRight className="size-4 text-neutral-500" />
      </div>

      <div className="absolute bottom-[30%] left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-md">
        <span>To {dropoff}</span>
        <ChevronRight className="size-4 text-neutral-300" />
      </div>
    </div>
  );
}
