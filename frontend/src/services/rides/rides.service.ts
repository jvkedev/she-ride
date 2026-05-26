import { apiFetch } from "@/services/api/api-client";

export interface RideEstimate {
  vehicleType: "CAR" | "AUTO" | "BIKE" | "SUV";
  estimatedFare: number;
  distanceInKm: number;
  nearbyCaptains: number;
}

export interface EstimateRidePayload {
  pickupAddress: string;
  dropAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropLatitude: number;
  dropLongitude: number;
}

export interface RequestRidePayload extends EstimateRidePayload {
  vehicleType: "CAR" | "AUTO" | "BIKE" | "SUV";
  paymentMethod?: "CASH" | "ONLINE";
}

export interface RequestRideResponse {
  rideId: string;
  status: string;
  estimatedFare: number;
  distanceInKm: number;
  nearbyCaptains: number;
  paymentMethod: string;
}

export interface RideHistoryItem {
  id: string;
  pickupAddress: string;
  dropAddress: string;
  distanceInKm: number;
  finalFare: number | null;
  estimatedFare: number;
  vehicleType: string;
  paymentMethod: string;
  status: "COMPLETED" | "CANCELED";
  startedAt: string | null;
  completedAt: string | null;
  captain?: {
    user: { fullName: string; phoneNumber: string };
    rating: number;
    vehicle: {
      brand: string;
      model: string;
      color: string;
      vehicleNumber: string;
    };
  };
}

export interface RideHistoryResponse {
  data: RideHistoryItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function estimateRide(
  payload: EstimateRidePayload,
): Promise<RideEstimate[]> {
  const res = await apiFetch("/rides/estimate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to estimate ride");
  return res.json();
}

export async function requestRide(
  payload: RequestRidePayload,
): Promise<RequestRideResponse> {
  const res = await apiFetch("/rides/request", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to request ride");
  return res.json();
}

export async function getRiderHistory(
  page = 1,
  limit = 10,
): Promise<RideHistoryResponse> {
  const res = await apiFetch(`/rides/history?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch ride history");
  return res.json();
}

export async function cancelRide(
  rideId: string,
  reason?: string,
): Promise<void> {
  const res = await apiFetch(`/rides/${rideId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Failed to cancel ride");
}
