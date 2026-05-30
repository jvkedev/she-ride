import { apiFetch } from "@/services/api/api-client";

export const CAPTAIN_REPORT_CATEGORIES = [
  { value: "UNSAFE_DRIVING", label: "Unsafe driving" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "INAPPROPRIATE_BEHAVIOR", label: "Inappropriate behavior" },
  { value: "VEHICLE_ISSUE", label: "Vehicle issue" },
  { value: "ROUTE_ISSUE", label: "Route issue" },
  { value: "FRAUD_OVERCHARGING", label: "Fraud or overcharging" },
  { value: "LATE_ARRIVAL", label: "Late arrival" },
  { value: "OTHER", label: "Other" },
] as const;

export type CaptainReportCategory =
  (typeof CAPTAIN_REPORT_CATEGORIES)[number]["value"];

export interface CaptainReport {
  id: string;
  rideId: string;
  category: string;
  description: string | null;
  status: string;
  createdAt: string;
}

export async function createCaptainReport(payload: {
  rideId: string;
  category: CaptainReportCategory;
  description?: string;
  imageUrl?: string;
}): Promise<CaptainReport> {
  const res = await apiFetch("/reports/captain", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      Array.isArray(body.message)
        ? body.message.join(", ")
        : body.message || "Failed to submit report",
    );
  }
  return body;
}

export async function getMyCaptainReports(): Promise<CaptainReport[]> {
  const res = await apiFetch("/reports/captain/mine");
  if (!res.ok) throw new Error("Failed to load reports");
  return res.json();
}
