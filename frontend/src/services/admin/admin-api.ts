import axiosClient from "@/services/api/axios-client";
import type {
  AdminDriverDetail,
  AdminPayment,
  AdminPaymentTrendPoint,
  AdminRide,
  AdminDriver,
  AdminRider,
} from "@/lib/admin/types";

function normalizeRideStatus(status: string): AdminRide["status"] {
  const lowerStatus = status.toLowerCase();

  if (
    lowerStatus === "ongoing" ||
    lowerStatus === "searching" ||
    lowerStatus === "accepted" ||
    lowerStatus === "arriving" ||
    lowerStatus === "in_progress"
  ) {
    return "ongoing";
  }

  if (lowerStatus === "completed") {
    return "completed";
  }

  return "cancelled";
}

// ── Riders ────────────────────────────────────────────────────────────────

export async function fetchRiders(): Promise<AdminRider[]> {
  const res = await axiosClient.get<AdminRider[] | { data: AdminRider[] }>(
    "/admin/riders",
  );
  return Array.isArray(res.data) ? res.data : res.data.data;
}

export async function blockRider(userId: string): Promise<void> {
  await axiosClient.patch(`/admin/riders/${userId}/block`);
}

export async function unblockRider(userId: string): Promise<void> {
  await axiosClient.patch(`/admin/riders/${userId}/unblock`);
}

// ── Stubs (fill in as you build each section) ─────────────────────────────

export async function fetchAdminOverview() {
  const res = await axiosClient.get("/admin/dashboard/stats");
  return res.data;
}

export async function fetchDrivers(): Promise<AdminDriver[]> {
  const res = await axiosClient.get<AdminDriver[] | { data: AdminDriver[] }>(
    "/admin/captains",
  );
  return Array.isArray(res.data) ? res.data : res.data.data;
}

export async function fetchDriverById(
  captainId: string,
): Promise<AdminDriverDetail> {
  const res = await axiosClient.get<
    AdminDriverDetail | { data: AdminDriverDetail }
  >(`/admin/captains/${captainId}`);
  return "data" in res.data ? res.data.data : res.data;
}

export async function updateDriverKyc(
  captainId: string,
  body: {
    status: "APPROVED" | "REJECTED";
    documentKey:
      | "driving_license"
      | "vehicle_rc"
      | "vehicle_insurance"
      | "government_id";
    rejectionReason?: string;
  },
): Promise<AdminDriverDetail> {
  const res = await axiosClient.patch<
    AdminDriverDetail | { data: AdminDriverDetail }
  >(`/admin/captains/${captainId}/document`, body);
  return "data" in res.data ? res.data.data : res.data;
}

export async function fetchRides(): Promise<AdminRide[]> {
  const res = await axiosClient.get<AdminRide[] | { data: AdminRide[] }>(
    "/admin/rides",
  );
  const rides = Array.isArray(res.data) ? res.data : res.data.data;

  return rides.map((ride) => ({
    ...ride,
    status: normalizeRideStatus(String(ride.status)),
  }));
}

export async function fetchPayments(): Promise<AdminPayment[]> {
  const res = await axiosClient.get<AdminPayment[] | { data: AdminPayment[] }>(
    "/admin/payments",
  );
  return Array.isArray(res.data) ? res.data : res.data.data;
}

export async function fetchPaymentsTrend(): Promise<AdminPaymentTrendPoint[]> {
  const res = await axiosClient.get<
    AdminPaymentTrendPoint[] | { data: AdminPaymentTrendPoint[] }
  >("/admin/payments/trend");
  return Array.isArray(res.data) ? res.data : res.data.data;
}
