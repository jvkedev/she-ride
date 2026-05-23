import type { LucideIcon } from "lucide-react";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { cn } from "@/lib/utils";

type StatWidgetProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: "default" | "primary";
  trend?: { value: string; positive?: boolean };
};

export default function StatWidget({
  label,
  value,
  hint,
  icon: Icon,
  accent = "default",
  trend,
}: StatWidgetProps) {
  return (
    <SurfaceCard padding="sm" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-neutral-500">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">
            {value}
          </p>
          {hint ? <p className="mt-0.5 text-xs text-neutral-500">{hint}</p> : null}
          {trend ? (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trend.positive ? "text-emerald-600" : "text-red-600",
              )}
            >
              {trend.value}
            </p>
          ) : null}
        </div>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            accent === "primary"
              ? "bg-primary/10 text-primary"
              : "bg-neutral-100 text-neutral-600",
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
    </SurfaceCard>
  );
}
