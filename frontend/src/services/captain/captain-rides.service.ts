import axios from "axios";

export interface CaptainRideRequest {
  rideId: string;
  passengerName: string;
  passengerRating: number;
  fare: number | null;
  distanceInKm: number | null;
  vehicleType: string;
  paymentMethod: string;
  pickup: string;
  dropoff: string;
}

export interface AcceptRideResponse {
  rideId: string;
  status: string;
  acceptedAt: string;
  captainId: string;
  rider: {
    name: string;
    phone: string;
  };
  pickupAddress: string;
  dropAddress: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("accessToken") ?? "";
}

function authHeader() {
  return { Authorization: `Bearer ${getToken()}` };
}

// Get all SEARCHING rides matching captain's vehicle type
export async function getSearchingRides(): Promise<CaptainRideRequest[]> {
  const { data } = await api.get("/rides/searching", {
    headers: authHeader(),
  });
  return data;
}

// Accept a ride request
export async function acceptRide(rideId: string): Promise<AcceptRideResponse> {
  const { data } = await api.patch(
    `/rides/${rideId}/accept`,
    {},
    { headers: authHeader() },
  );
  return data;
}

export async function updateLocation(lat: number, lng: number): Promise<void> {
  await api.patch("/rides/location", { lat, lng }, { headers: authHeader() });
}

// Mark captain as arrived at pickup
export async function markArrived(rideId: string): Promise<void> {
  await api.patch(`/rides/${rideId}/arrived`, {}, { headers: authHeader() });
}

// Start ride with OTP verification
export async function startRide(rideId: string, otp: string): Promise<void> {
  await api.patch(`/rides/${rideId}/start`, { otp }, { headers: authHeader() });
}

// Complete ride
export async function completeRide(rideId: string): Promise<void> {
  await api.patch(`/rides/${rideId}/complete`, {}, { headers: authHeader() });
}

// Decline — local only, no backend call needed
export function declineRide(rideId: string): void {
  // No backend endpoint — just remove from local list
  console.log("Declined ride:", rideId);
}
