import { create } from "zustand";

interface CaptainStore {
  activeRideId: string | null;
  setActiveRideId: (rideId: string | null) => void;
}

export const useCaptainStore = create<CaptainStore>((set) => ({
  activeRideId: null,
  setActiveRideId: (id: string | null) => set({ activeRideId: id }),
}));
