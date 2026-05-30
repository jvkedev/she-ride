import { apiFetch } from "@/services/api/api-client";

export interface CaptainDashboardStats {
  captain: {
    name: string;
    isOnline: boolean;
    rating: number;
    totalTrips: number;
    vehicleType: string | null;
    plateNumber: string | null;
  };
  today: {
    trips: number;
    earnings: number;
  };
  activeRide: { rideId: string; status: string } | null;
  nearbyRequests: number;
}

export async function getCaptainDashboard(): Promise<CaptainDashboardStats> {
  const res = await apiFetch("/captain/dashboard");
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}
