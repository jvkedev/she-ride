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
