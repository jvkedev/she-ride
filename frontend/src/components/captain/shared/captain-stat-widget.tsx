import type { LucideIcon } from "lucide-react";

import CaptainCard from "@/components/captain/shared/captain-card";
import { cn } from "@/lib/utils";

type CaptainStatWidgetProps = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: "default" | "primary";
};

export default function CaptainStatWidget({
  label,
  value,
  hint,
  icon: Icon,
  accent = "default",
}: CaptainStatWidgetProps) {
  return (
    <CaptainCard padding="sm" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-neutral-500">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-neutral-900">
            {value}
          </p>
          {hint ? (
            <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>
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
    </CaptainCard>
  );
}
