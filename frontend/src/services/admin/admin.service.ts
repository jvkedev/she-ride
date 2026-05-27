import axiosClient from "@/services/api/axios-client";
import type { AdminRider } from "@/lib/admin/types";

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

export async function fetchDrivers() {
  const res = await axiosClient.get("/admin/drivers");
  return res.data;
}

export async function fetchRides() {
  const res = await axiosClient.get("/admin/rides");
  return res.data;
}