import PriorityBadge from "@/components/shared/security/priority-badge";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import type { SecurityPriority } from "@/lib/security/types";
import { cn } from "@/lib/utils";

type AlertCardProps = {
  title: string;
  description: string;
  priority: SecurityPriority;
  time: string;
  actions?: React.ReactNode;
  className?: string;
  pulse?: boolean;
};

export default function AlertCard({
  title,
  description,
  priority,
  time,
  actions,
  className,
  pulse = false,
}: AlertCardProps) {
  return (
    <SurfaceCard
      padding="sm"
      className={cn(
        "border-l-4",
        priority === "critical" && "border-l-red-500",
        priority === "high" && "border-l-orange-500",
        priority === "medium" && "border-l-amber-500",
        priority === "low" && "border-l-neutral-300",
        pulse && priority === "critical" && "animate-pulse",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
            <PriorityBadge priority={priority} />
          </div>
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
          <p className="mt-2 text-xs text-neutral-400">{time}</p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </SurfaceCard>
  );
}
