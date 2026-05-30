import axiosClient from "@/services/api/axios-client";
import type { DashboardStatus } from "@/components/shared/dashboard/status-badge";
import type {
  AdminDriverDetail,
  AdminPayment,
  AdminPaymentTrendPoint,
  AdminRide,
  AdminDriver,
  AdminRider,
  AdminActivity,
  AdminSosAlert,
  AdminTicket,
} from "@/lib/admin/types";

export type AdminDashboardStats = {
  overview: {
    totalRiders: number;
    totalCaptains: number;
    totalRides: number;
    completedRides: number;
    cancelledRides: number;
    totalRevenue: number;
    revenueToday: number;
    revenueThisWeek: number;
    revenueThisMonth: number;
    onlineCaptains: number;
    activeRides: number;
    pendingKyc: number;
    approvedKyc?: number;
    rejectedKyc?: number;
    pendingReports: number;
    openSupportTickets: number;
  };
  thisMonth: {
    newRiders: number;
    newCaptains: number;
    rides: number;
    revenue: number;
    revenueGrowthPercent: number | null;
  };
  today: {
    rides: number;
    revenue: number;
  };
  rates: {
    completionRate: number;
    cancellationRate: number;
  };
};

export type AdminLiveOperations = {
  stats: {
    activeRides: number;
    onlineCaptains: number;
    ridersOnTrip: number;
    activeSos: number;
  };
  activeRides: Array<{
    id: string;
    status: string;
    riderName: string;
    captainName: string | null;
    pickup: string;
    dropoff: string;
    pickupLat: number | null;
    pickupLng: number | null;
    dropLat: number | null;
    dropLng: number | null;
    captainLat: number | null;
    captainLng: number | null;
  }>;
  captains: Array<{
    id: string;
    name: string;
    vehicleType: string | null;
    plate: string | null;
    lat: number;
    lng: number;
    updatedAt: string | null;
  }>;
};

export type AdminRiderDetail = AdminRider & {
  recentRides: Array<{
    id: string;
    driverName: string;
    pickup: string;
    dropoff: string;
    fare: number;
    status: string;
    createdAt: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    completedAt: string;
    pickup: string;
    dropoff: string;
  }>;
  reports: Array<{
    id: string;
    category: string;
    status: string;
    description: string | null;
    captainName: string;
    ride: { pickupAddress: string; dropAddress: string; status: string };
    createdAt: string;
  }>;
};

function normalizeAccountStatus(status: string): DashboardStatus {
  if (status === "blocked") return "inactive";
  if (status === "active") return "active";
  return status as DashboardStatus;
}

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
  const riders = Array.isArray(res.data) ? res.data : res.data.data;
  return riders.map((rider) => ({
    ...rider,
    status: normalizeAccountStatus(String(rider.status)),
    joinedAt:
      typeof rider.joinedAt === "string"
        ? rider.joinedAt
        : new Date(rider.joinedAt).toISOString(),
  }));
}

export async function fetchRiderById(userId: string): Promise<AdminRiderDetail> {
  const res = await axiosClient.get<AdminRiderDetail>(
    `/admin/riders/${userId}`,
  );
  return {
    ...res.data,
    status: normalizeAccountStatus(String(res.data.status)),
  };
}

export async function blockRider(userId: string): Promise<void> {
  await axiosClient.patch(`/admin/riders/${userId}/block`);
}

export async function unblockRider(userId: string): Promise<void> {
  await axiosClient.patch(`/admin/riders/${userId}/unblock`);
}

// ── Dashboard ─────────────────────────────────────────────────────────────

export async function fetchAdminOverview(): Promise<AdminDashboardStats> {
  const res = await axiosClient.get<AdminDashboardStats>(
    "/admin/dashboard/stats",
  );
  return res.data;
}

export async function fetchDailyRevenue(): Promise<
  Array<{ label: string; tripAmount: number; trips: number }>
> {
  const res = await axiosClient.get("/admin/dashboard/daily-revenue");
  return res.data;
}

export async function fetchRideTrends(): Promise<
  Array<{ label: string; total: number; completed: number; cancelled: number }>
> {
  const res = await axiosClient.get("/admin/dashboard/ride-trends");
  return res.data;
}

export async function fetchGrowthChart(): Promise<
  Array<{ label: string; riders: number; captains: number }>
> {
  const res = await axiosClient.get("/admin/dashboard/growth-chart");
  return res.data;
}

export async function fetchActivityFeed(): Promise<AdminActivity[]> {
  const res = await axiosClient.get<
    Array<{
      id: string;
      message: string;
      time: string;
      type: "ride" | "rider" | "captain" | "kyc";
    }>
  >("/admin/dashboard/activity-feed");

  return res.data.map((item) => ({
    id: item.id,
    message: item.message,
    time: new Date(item.time).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    type:
      item.type === "captain"
        ? "driver"
        : item.type === "kyc"
          ? "driver"
          : item.type === "rider"
            ? "payment"
            : item.type,
  }));
}

export async function fetchLiveOperations(): Promise<AdminLiveOperations> {
  const res = await axiosClient.get<AdminLiveOperations>("/admin/operations/live");
  return res.data;
}

export async function fetchActiveSosAlerts(): Promise<AdminSosAlert[]> {
  const res = await axiosClient.get<
    Array<{
      id: string;
      rideId: string | null;
      status: string;
      address: string | null;
      latitude: number;
      longitude: number;
      createdAt: string;
      rider: { user: { fullName: string } };
      ride: {
        captain?: { user: { fullName: string } } | null;
      } | null;
    }>
  >("/security/sos/active");

  return res.data.map((alert) => ({
    id: alert.id,
    rideId: alert.rideId ?? "—",
    riderName: alert.rider.user.fullName,
    driverName: alert.ride?.captain?.user.fullName ?? "—",
    location:
      alert.address ??
      `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`,
    status: alert.status as AdminSosAlert["status"],
    triggeredAt: new Date(alert.createdAt).toLocaleString("en-IN"),
  }));
}

export async function resolveSosAlert(
  id: string,
  body: { status: "RESOLVED" | "FALSE_ALARM"; resolutionNote?: string },
): Promise<void> {
  await axiosClient.patch(`/security/sos/${id}/resolve`, body);
}

export async function fetchSupportTickets(): Promise<AdminTicket[]> {
  const res = await axiosClient.get<
    Array<{
      id: string;
      subject: string;
      status: string;
      category: string;
      updatedAt: string;
      rider: { user: { fullName: string } };
    }>
  >("/support/admin/tickets");

  return res.data.map((ticket) => ({
    id: ticket.id,
    subject: ticket.subject,
    user: ticket.rider.user.fullName,
    role: "rider" as const,
    status: mapTicketStatus(ticket.status),
    priority: mapTicketPriority(ticket.category),
    updatedAt: new Date(ticket.updatedAt).toLocaleString("en-IN"),
  }));
}

export async function fetchSupportTicket(id: string) {
  const res = await axiosClient.get(`/support/admin/tickets/${id}`);
  return res.data as {
    id: string;
    subject: string;
    description: string;
    status: string;
    category: string;
    adminResponse: string | null;
    createdAt: string;
    updatedAt: string;
    rider: { user: { fullName: string; email: string; phoneNumber: string } };
    ride: {
      id: string;
      pickupAddress: string;
      dropAddress: string;
      status: string;
    } | null;
  };
}

export async function updateSupportTicket(
  id: string,
  body: { status?: string; adminResponse?: string },
) {
  const res = await axiosClient.patch(`/support/admin/tickets/${id}`, body);
  return res.data;
}

export async function updateCaptainReportStatus(
  id: string,
  body: { status: string; adminNote?: string },
) {
  const res = await axiosClient.patch(`/reports/captain/admin/${id}`, body);
  return res.data;
}

export async function blockCaptain(captainId: string): Promise<void> {
  await axiosClient.patch(`/admin/captains/${captainId}/block`);
}

export async function unblockCaptain(captainId: string): Promise<void> {
  await axiosClient.patch(`/admin/captains/${captainId}/unblock`);
}

export type AdminFareSetting = {
  vehicleType: string;
  label: string;
  base: number;
  perKm: number;
};

export type AdminRoleStat = {
  role: string;
  name: string;
  users: number;
  permissions: string;
};

export async function fetchFareSettings(): Promise<AdminFareSetting[]> {
  const res = await axiosClient.get<AdminFareSetting[]>("/admin/settings/fare");
  return res.data;
}

export async function updateFareSettings(
  rates: Array<{ vehicleType: string; base: number; perKm: number }>,
): Promise<AdminFareSetting[]> {
  const res = await axiosClient.patch<AdminFareSetting[]>("/admin/settings/fare", {
    rates,
  });
  return res.data;
}

export async function fetchRoleStats(): Promise<AdminRoleStat[]> {
  const res = await axiosClient.get<AdminRoleStat[]>("/admin/settings/roles");
  return res.data;
}

function mapTicketStatus(status: string): AdminTicket["status"] {
  const lower = status.toLowerCase();
  if (lower === "open") return "open";
  if (lower === "in_progress") return "in_progress";
  if (lower === "resolved") return "resolved";
  return "cancelled";
}

function mapTicketPriority(
  category: string,
): AdminTicket["priority"] {
  if (category === "SAFETY") return "high";
  if (category === "PAYMENT" || category === "RIDE_ISSUE") return "medium";
  return "low";
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
  const res = await axiosClient.get<AdminDriverDetail | { data: AdminDriverDetail }>(
    `/admin/captains/${captainId}`,
  );
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
