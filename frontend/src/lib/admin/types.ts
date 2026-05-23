import type { DashboardStatus } from "@/components/shared/dashboard/status-badge";

export type AdminDriver = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  rating: number;
  trips: number;
  status: DashboardStatus;
  kycStatus: DashboardStatus;
  joinedAt: string;
};

export type AdminRider = {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalRides: number;
  rating: number;
  status: DashboardStatus;
  joinedAt: string;
};

export type AdminRide = {
  id: string;
  riderName: string;
  driverName: string;
  pickup: string;
  dropoff: string;
  fare: number;
  distance: string;
  status: DashboardStatus;
  createdAt: string;
};

export type AdminSosAlert = {
  id: string;
  rideId: string;
  riderName: string;
  driverName: string;
  location: string;
  status: DashboardStatus;
  triggeredAt: string;
};

export type AdminTransaction = {
  id: string;
  type: "payout" | "refund" | "fare" | "fee";
  party: string;
  amount: number;
  status: DashboardStatus;
  date: string;
};

export type AdminTicket = {
  id: string;
  subject: string;
  user: string;
  role: "rider" | "captain";
  status: DashboardStatus;
  priority: "low" | "medium" | "high";
  updatedAt: string;
};

export type AdminActivity = {
  id: string;
  message: string;
  time: string;
  type: "ride" | "driver" | "payment" | "safety";
};
