import { create } from "zustand";

export interface ActiveRideMapState {
  rideId: string;
  status: string;
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
  vehicleType: string;
  pickupAddress: string;
  dropAddress: string;
}

interface CaptainStore {
  activeRideId: string | null;
  activeRide: ActiveRideMapState | null;
  setActiveRideId: (rideId: string | null) => void;
  setActiveRide: (ride: ActiveRideMapState | null) => void;
  clearActiveRide: () => void;
}

export const useCaptainStore = create<CaptainStore>((set) => ({
  activeRideId: null,
  activeRide: null,
  setActiveRideId: (id) => set({ activeRideId: id }),
  setActiveRide: (ride) =>
    set({
      activeRide: ride,
      activeRideId: ride?.rideId ?? null,
    }),
  clearActiveRide: () => set({ activeRideId: null, activeRide: null }),
}));
