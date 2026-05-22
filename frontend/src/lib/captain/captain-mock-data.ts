export type CaptainProfile = {
  id: string;
  name: string;
  rating: number;
  totalTrips: number;
  vehicle: string;
  plateNumber: string;
};

export type DailyStats = {
  trips: number;
  earnings: number;
  rating: number;
  onlineHours: number;
};

export type RideRequest = {
  id: string;
  passengerName: string;
  passengerRating: number;
  pickup: string;
  dropoff: string;
  fare: number;
  distance: string;
  eta: string;
  paymentMethod: "cash" | "wallet" | "upi";
  vehicleType: string;
};

export type ActiveRide = {
  id: string;
  passengerName: string;
  passengerPhone: string;
  pickup: string;
  dropoff: string;
  fare: number;
  status: "en_route_pickup" | "arrived" | "on_trip" | "completed";
  otp: string;
};

export const captainProfile: CaptainProfile = {
  id: "cap-001",
  name: "Priya Sharma",
  rating: 4.92,
  totalTrips: 1248,
  vehicle: "She Auto",
  plateNumber: "DL 01 AB 4521",
};

export const todayStats: DailyStats = {
  trips: 12,
  earnings: 2840,
  rating: 4.95,
  onlineHours: 6.5,
};

export const todayEarningsSummary = {
  total: 2840,
  trips: 12,
  incentives: 320,
  netPayout: 2520,
};

export const incomingRequests: RideRequest[] = [
  {
    id: "req-101",
    passengerName: "Ananya K.",
    passengerRating: 4.8,
    pickup: "ITL Twin Tower, Noida",
    dropoff: "Sector 18 Metro Station",
    fare: 89,
    distance: "3.2 km",
    eta: "4 min",
    paymentMethod: "upi",
    vehicleType: "She Auto",
  },
  {
    id: "req-102",
    passengerName: "Meera S.",
    passengerRating: 4.9,
    pickup: "DLF Mall of India",
    dropoff: "Botanical Garden Metro",
    fare: 124,
    distance: "5.1 km",
    eta: "6 min",
    paymentMethod: "wallet",
    vehicleType: "She Auto",
  },
];

export const activeRide: ActiveRide = {
  id: "ride-8821",
  passengerName: "Riya Patel",
  passengerPhone: "+91 98765 43210",
  pickup: "Wave City Center",
  dropoff: "Rajiv Chowk Metro",
  fare: 156,
  status: "on_trip",
  otp: "4829",
};

export const weeklyEarnings = [
  { day: "Mon", amount: 2100 },
  { day: "Tue", amount: 2840 },
  { day: "Wed", amount: 1920 },
  { day: "Thu", amount: 3150 },
  { day: "Fri", amount: 2680 },
  { day: "Sat", amount: 3420 },
  { day: "Sun", amount: 1840 },
];

export const recentTransactions = [
  { id: "tx-1", label: "Trip fare", amount: 156, type: "credit" as const, date: "Today, 2:40 PM" },
  { id: "tx-2", label: "Weekly payout", amount: 12500, type: "credit" as const, date: "Yesterday" },
  { id: "tx-3", label: "Platform fee", amount: 45, type: "debit" as const, date: "Yesterday" },
];

export const rideHistoryItems = [
  {
    id: "h-1",
    passenger: "Sneha R.",
    route: "Sector 62 → Connaught Place",
    fare: 198,
    date: "Today, 11:20 AM",
    status: "completed" as const,
  },
  {
    id: "h-2",
    passenger: "Kavya M.",
    route: "Noida City Centre → Akshardham",
    fare: 245,
    date: "Today, 9:05 AM",
    status: "completed" as const,
  },
];
