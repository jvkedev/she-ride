import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type DashboardStatus =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "online"
  | "offline"
  | "busy"
  | "completed"
  | "cancelled"
  | "in_progress"
  | "open"
  | "resolved"
  | "critical";

const statusConfig: Record<
  DashboardStatus,
  { label: string; className: string }
> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  inactive: { label: "Inactive", className: "bg-neutral-100 text-neutral-600 border-neutral-200" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-600 border-red-200" },
  online: { label: "Online", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  offline: { label: "Offline", className: "bg-neutral-100 text-neutral-600 border-neutral-200" },
  busy: { label: "Busy", className: "bg-amber-50 text-amber-700 border-amber-200" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", className: "bg-red-50 text-red-600 border-red-200" },
  in_progress: { label: "In progress", className: "bg-blue-50 text-blue-700 border-blue-200" },
  open: { label: "Open", className: "bg-amber-50 text-amber-700 border-amber-200" },
  resolved: { label: "Resolved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  critical: { label: "Critical", className: "bg-red-50 text-red-700 border-red-300" },
};

type StatusBadgeProps = {
  status: DashboardStatus;
  label?: string;
  className?: string;
};

export default function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        config.className,
        className,
      )}
    >
      {label ?? config.label}
    </Badge>
  );
}
