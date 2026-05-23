import type { FilterOption } from "@/components/shared/dashboard/search-toolbar";

export const PRIORITY_FILTERS: FilterOption[] = [
  { label: "All priorities", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export const INCIDENT_STATUS_FILTERS: FilterOption[] = [
  { label: "All statuses", value: "all" },
  { label: "Open", value: "open" },
  { label: "In progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
];

export const FRAUD_TYPE_LABELS: Record<string, string> = {
  gps_spoof: "GPS spoofing",
  multi_account: "Multiple accounts",
  payment: "Payment fraud",
  login: "Suspicious login",
  device: "Device anomaly",
};
