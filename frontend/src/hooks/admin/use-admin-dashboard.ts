import { useQuery } from "@tanstack/react-query";

import {
  fetchActivityFeed,
  fetchAdminOverview,
  fetchDailyRevenue,
  fetchGrowthChart,
  fetchRideTrends,
} from "@/services/admin/admin.service";

const REFRESH_MS = 30_000;

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: fetchAdminOverview,
    refetchInterval: REFRESH_MS,
    staleTime: 15_000,
  });
}

export function useAdminDailyRevenue() {
  return useQuery({
    queryKey: ["admin", "dashboard", "daily-revenue"],
    queryFn: fetchDailyRevenue,
    refetchInterval: REFRESH_MS,
    staleTime: 15_000,
  });
}

export function useAdminRideTrends() {
  return useQuery({
    queryKey: ["admin", "dashboard", "ride-trends"],
    queryFn: fetchRideTrends,
    refetchInterval: REFRESH_MS,
    staleTime: 15_000,
  });
}

export function useAdminGrowthChart() {
  return useQuery({
    queryKey: ["admin", "dashboard", "growth"],
    queryFn: fetchGrowthChart,
    refetchInterval: REFRESH_MS,
    staleTime: 15_000,
  });
}

export function useAdminActivityFeed() {
  return useQuery({
    queryKey: ["admin", "dashboard", "activity"],
    queryFn: fetchActivityFeed,
    refetchInterval: REFRESH_MS,
    staleTime: 15_000,
  });
}
