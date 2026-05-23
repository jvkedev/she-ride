/**
 * Admin API service layer — wire to backend when ready.
 * Keep fetch logic here; components consume via React Query hooks.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function fetchAdminOverview() {
  // return (await fetch(`${BASE}/admin/overview`)).json();
  return null;
}

export async function fetchDrivers() {
  return null;
}

export async function fetchRiders() {
  return null;
}

export async function fetchRides() {
  return null;
}
