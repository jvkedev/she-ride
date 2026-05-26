import { create } from "zustand";

interface CaptainStore {
  activeRideId: string | null;
  setActiveRideId: (rideId: string | null) => void;
}

export const useCaptainStore = create<CaptainStore>((set) => ({
  activeRideId: null,
  setActiveRideId: (rideId) => {
    console.log("Zustand setActiveRideId called with:", rideId);
    set({ activeRideId: rideId });
  },
}));
