import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type RiderKpiAccent = "pink" | "violet" | "amber" | "cyan";

const accentStyles: Record<RiderKpiAccent, string> = {
  pink: "bg-gradient-to-br from-[#ff2e6d] to-[#ff6b9d] shadow-[0_8px_24px_-8px_rgba(255,46,109,0.55)]",
  violet:
    "bg-gradient-to-br from-violet-500 to-purple-600 shadow-[0_8px_24px_-8px_rgba(139,92,246,0.45)]",
  amber:
    "bg-gradient-to-br from-amber-500 to-orange-500 shadow-[0_8px_24px_-8px_rgba(245,158,11,0.45)]",
  cyan: "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_8px_24px_-8px_rgba(6,182,212,0.45)]",
};

type RiderKpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: RiderKpiAccent;
  className?: string;
};

export default function RiderKpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "pink",
  className,
}: RiderKpiCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-4 text-white",
        accentStyles[accent],
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-4 -top-4 size-20 rounded-full bg-white/15" />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/85">
            {label}
          </p>
          <p className="mt-1 truncate text-xl font-bold tracking-tight">{value}</p>
          {hint ? <p className="mt-0.5 text-xs text-white/80">{hint}</p> : null}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  );
}
