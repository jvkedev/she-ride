import type { FilterOption } from "@/components/shared/dashboard/search-toolbar";

export const DRIVER_STATUS_FILTERS: FilterOption[] = [
  { label: "All drivers", value: "all" },
  { label: "Pending KYC", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export const RIDE_STATUS_FILTERS: FilterOption[] = [
  { label: "All rides", value: "all" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export const TICKET_STATUS_FILTERS: FilterOption[] = [
  { label: "All tickets", value: "all" },
  { label: "Open", value: "open" },
  { label: "In progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
];
