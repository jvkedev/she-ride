import { ChevronDown, Clock } from "lucide-react";

import { cn } from "@/lib/utils";

type ScheduleSelectorProps = {
  label?: string;
  className?: string;
};

export default function ScheduleSelector({
  label = "Pick up now",
  className,
}: ScheduleSelectorProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-12 w-full items-center justify-between rounded-lg bg-[#eeeeee] px-4 text-[15px] text-neutral-900 transition hover:bg-[#e5e5e5]",
        className,
      )}
    >
      <span className="flex items-center gap-3">
        <Clock className="size-4 text-neutral-700" />
        {label}
      </span>
      <ChevronDown className="size-4 text-neutral-500" />
    </button>
  );
}
