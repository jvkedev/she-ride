import axios from "axios";

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

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

function getToken() {
  return localStorage.getItem("accessToken") ?? "";
}

export async function estimateRide(
  payload: EstimateRidePayload,
): Promise<RideEstimate[]> {
  const { data } = await api.post("/rides/estimate", payload, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return data;
}

export async function requestRide(
  payload: RequestRidePayload,
): Promise<RequestRideResponse> {
  const { data } = await api.post("/rides/request", payload, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return data;
}

export interface RideHistoryResponse {
  data: RideHistoryItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function getRiderHistory(
  page = 1,
  limit = 10,
): Promise<RideHistoryResponse> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/rides/history?page=${page}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error("Failed to fetch ride history");
  return res.json();
}

export async function cancelRide(
  rideId: string,
  reason?: string,
): Promise<void> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/rides/${rideId}/cancel`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    },
  );
  if (!res.ok) throw new Error("Failed to cancel ride");
}
