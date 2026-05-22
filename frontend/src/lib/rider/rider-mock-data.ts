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
