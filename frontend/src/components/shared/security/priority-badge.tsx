import { Badge } from "@/components/ui/badge";
import type { SecurityPriority } from "@/lib/security/types";
import { cn } from "@/lib/utils";

const styles: Record<SecurityPriority, string> = {
  low: "border-neutral-200 bg-neutral-50 text-neutral-600",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-orange-200 bg-orange-50 text-orange-800",
  critical: "border-red-300 bg-red-50 text-red-700",
};

type PriorityBadgeProps = {
  priority: SecurityPriority;
  className?: string;
};

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2 py-0.5 text-xs font-semibold capitalize",
        styles[priority],
        className,
      )}
    >
      {priority}
    </Badge>
  );
}
