import type { DashboardStatus } from "@/components/shared/dashboard/status-badge";

export type AdminDriver = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  vehicle: string;
  plate: string;
  rating: number;
  trips: number;
  status: DashboardStatus;
  kycStatus: DashboardStatus;
  joinedAt: string;
};

export type AdminDriverDocument = {
  key: "driving_license" | "rc_registration" | "aadhaar" | "selfie";
  label: string;
  number?: string | null;
  imageUrl?: string | null;
  status: DashboardStatus;
};

export type AdminDriverDetail = AdminDriver & {
  documentStatus: DashboardStatus;
  rejectionReason?: string | null;
  documents: AdminDriverDocument[];
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

export type AdminPayment = {
  id: string;
  rideId: string;
  riderName: string;
  driverName: string;
  tripAmount: number;
  paymentMethod: string;
  completedAt: string;
  status: "completed";
  pickup: string;
  dropoff: string;
};

export type AdminPaymentTrendPoint = {
  label: string;
  tripAmount: number;
  trips: number;
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
