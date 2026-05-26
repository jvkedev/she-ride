import { apiFetch } from "@/services/api/api-client";

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

export interface ActiveRideDetails {
  rideId: string;
  status: string;
  rider: {
    name: string;
    phone: string;
  };
  pickupAddress: string;
  dropAddress: string;
  estimatedFare: number | null;
  finalFare: number | null;
  distanceInKm: number | null;
  vehicleType: string;
  paymentMethod: string;
}

export async function getSearchingRides(): Promise<CaptainRideRequest[]> {
  const res = await apiFetch("/rides/searching");
  if (!res.ok) throw new Error("Failed to fetch rides");
  return res.json();
}

export async function acceptRide(rideId: string): Promise<AcceptRideResponse> {
  const res = await apiFetch(`/rides/${rideId}/accept`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to accept ride");
  return res.json();
}

export async function updateLocation(lat: number, lng: number): Promise<void> {
  await apiFetch("/rides/location", {
    method: "PATCH",
    body: JSON.stringify({ lat, lng }),
  });
}

export async function markArrived(rideId: string): Promise<void> {
  const res = await apiFetch(`/rides/${rideId}/arrived`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to mark arrived");
}

export async function startRide(rideId: string, otp: string): Promise<void> {
  const res = await apiFetch(`/rides/${rideId}/start`, {
    method: "PATCH",
    body: JSON.stringify({ otp }),
  });
  if (!res.ok) throw new Error("Failed to start ride");
}

export async function completeRide(rideId: string): Promise<void> {
  const res = await apiFetch(`/rides/${rideId}/complete`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to complete ride");
}

export async function cancelRideAsCaptain(
  rideId: string,
  reason?: string,
): Promise<void> {
  const res = await apiFetch(`/rides/${rideId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Failed to cancel ride");
}

export async function getActiveRide(
  rideId: string,
): Promise<ActiveRideDetails> {
  const res = await apiFetch(`/rides/${rideId}/details`);
  if (!res.ok) throw new Error("Failed to fetch active ride");
  return res.json();
}

export function declineRide(rideId: string): void {
  console.log("Declined ride:", rideId);
}
