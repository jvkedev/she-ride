import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CaptainStatus =
  | "online"
  | "offline"
  | "busy"
  | "pending"
  | "completed"
  | "cancelled";

const statusStyles: Record<
  CaptainStatus,
  { label: string; className: string }
> = {
  online: {
    label: "Online",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  offline: {
    label: "Offline",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
  busy: {
    label: "On ride",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600 border-red-200",
  },
};

type CaptainStatusBadgeProps = {
  status: CaptainStatus;
  className?: string;
};

export default function CaptainStatusBadge({
  status,
  className,
}: CaptainStatusBadgeProps) {
  const config = statusStyles[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}
