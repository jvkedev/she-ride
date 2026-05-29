import { apiFetch } from "@/services/api/api-client";

export interface CaptainEarningsSummary {
  total: number;
  trips: number;
  netPayout: number;
  tripFares: number;
}

export interface CaptainEarningsDaily {
  day: string;
  amount: number;
}

export interface CaptainEarningsStats {
  totalTrips: number;
  avgPerTrip: number;
  completionRate: string;
  peakHours: string;
  weekTotal: number;
}

export interface CaptainEarningsResponse {
  dailySummary: CaptainEarningsSummary;
  summary: CaptainEarningsSummary;
  weekly: CaptainEarningsDaily[];
  weekStats: CaptainEarningsStats;
}

export async function getCaptainEarnings(): Promise<CaptainEarningsResponse> {
  const res = await apiFetch("/captain/earnings");
  if (!res.ok) {
    throw new Error("Failed to fetch captain earnings");
  }
  return res.json();
}
