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
  | "ongoing"
  | "completed"
  | "cancelled"
  | "in_progress"
  | "open"
  | "resolved"
  | "critical"
  // ── Security — SOS ──
  | "ACTIVE"
  | "RESOLVED"
  | "FALSE_ALARM"
  // ── Security — Incidents ──
  | "OPEN"
  | "INVESTIGATING"
  | "CLOSED"
  | "REJECTED"
  // ── Security — Fraud ──
  | "UNDER_REVIEW"
  | "FALSE_POSITIVE"
  // ── Security — Risk ──
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

const statusConfig: Record<
  DashboardStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  inactive: {
    label: "Inactive",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-600 border-red-200",
  },
  online: {
    label: "Online",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  offline: {
    label: "Offline",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
  busy: {
    label: "Busy",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  ongoing: {
    label: "Ongoing",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600 border-red-200",
  },
  in_progress: {
    label: "In progress",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  open: {
    label: "Open",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  critical: {
    label: "Critical",
    className: "bg-red-50 text-red-700 border-red-300",
  },
  // ── SOS ──
  ACTIVE: {
    label: "Active",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  FALSE_ALARM: {
    label: "False Alarm",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
  // ── Incidents ──
  OPEN: {
    label: "Open",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  INVESTIGATING: {
    label: "Investigating",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  CLOSED: {
    label: "Closed",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-600 border-red-200",
  },
  // ── Fraud ──
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  FALSE_POSITIVE: {
    label: "False Positive",
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
  // ── Risk levels ──
  CRITICAL: {
    label: "Critical",
    className: "bg-red-50 text-red-700 border-red-300",
  },
  HIGH: {
    label: "High",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  LOW: {
    label: "Low",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

type StatusBadgeProps = {
  status: DashboardStatus;
  label?: string;
  className?: string;
};

export default function StatusBadge({
  status,
  label,
  className,
}: StatusBadgeProps) {
  const config =
    statusConfig[status] ??
    ({
      label: status.replace(/_/g, " "),
      className: "bg-neutral-100 text-neutral-600 border-neutral-200",
    } as const);
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
