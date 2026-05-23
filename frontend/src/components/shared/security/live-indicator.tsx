import { cn } from "@/lib/utils";

type LiveIndicatorProps = {
  connected?: boolean;
  label?: string;
  className?: string;
};

export default function LiveIndicator({
  connected = true,
  label = "Live",
  className,
}: LiveIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        connected
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-neutral-200 bg-neutral-100 text-neutral-500",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          connected ? "animate-pulse bg-emerald-500" : "bg-neutral-400",
        )}
      />
      {label}
    </span>
  );
}
