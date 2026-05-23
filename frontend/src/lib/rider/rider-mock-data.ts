export type RiderProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  totalRides: number;
  rating: number;
};

export const riderProfile: RiderProfile = {
  id: "rider-001",
  name: "Ananya Kapoor",
  email: "ananya.kapoor@email.com",
  phone: "+91 98765 43210",
  memberSince: "Jan 2024",
  totalRides: 86,
  rating: 4.9,
};

export const activeTrackRide = {
  vehicle: "She Go",
  status: "On the way",
  otp: "4829",
  etaMinutes: 4,
  distanceKm: 3.2,
  fare: 189,
  pickup: "ITL Twin Tower",
  dropoff: "Century Public School",
  driver: {
    name: "Priya Sharma",
    rating: 4.9,
    plate: "DL 01 AB 1234",
  },
  timeline: [
    { label: "Driver assigned", done: true },
    { label: "On the way to pickup", done: true },
    { label: "Arriving at pickup", done: false },
    { label: "Trip started", done: false },
  ],
};
