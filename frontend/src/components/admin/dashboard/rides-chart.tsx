"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "@/components/shared/dashboard/chart-card";
import {
  useAdminGrowthChart,
  useAdminRideTrends,
} from "@/hooks/admin/use-admin-dashboard";

export default function RidesChart() {
  const trends = useAdminRideTrends();
  const growth = useAdminGrowthChart();

  const rideData =
    trends.data?.map((point) => ({
      day: point.label,
      rides: point.completed,
      total: point.total,
      cancelled: point.cancelled,
    })) ?? [];

  const growthData =
    growth.data?.map((point) => ({
      month: point.label,
      riders: point.riders,
      captains: point.captains,
    })) ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Ride volume" description="Completed trips per day">
        {trends.isLoading ? (
          <div className="flex h-full min-h-48 items-center justify-center text-sm text-neutral-400">
            Loading…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={rideData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5" }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="rides"
                name="Completed"
                stroke="#ff2e6d"
                strokeWidth={2}
                dot={{ fill: "#ff2e6d", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="cancelled"
                name="Cancelled"
                stroke="#9ca3af"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Platform growth" description="New riders & captains per month">
        {growth.isLoading ? (
          <div className="flex h-full min-h-48 items-center justify-center text-sm text-neutral-400">
            Loading…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={growthData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5" }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="riders"
                name="Riders"
                stroke="#6366f1"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="captains"
                name="Captains"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
