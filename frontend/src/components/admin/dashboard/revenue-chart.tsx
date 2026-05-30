"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "@/components/shared/dashboard/chart-card";
import { useAdminDailyRevenue } from "@/hooks/admin/use-admin-dashboard";

export default function RevenueChart() {
  const { data, isLoading, isError } = useAdminDailyRevenue();

  const chartData =
    data?.map((point) => ({
      day: point.label,
      revenue: point.tripAmount,
    })) ?? [];

  return (
    <ChartCard title="Revenue overview" description="Last 7 days">
      {isLoading ? (
        <div className="flex h-full min-h-48 items-center justify-center text-sm text-neutral-400">
          Loading chart…
        </div>
      ) : isError ? (
        <div className="flex h-full min-h-48 items-center justify-center text-sm text-red-500">
          Failed to load revenue data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) => [
                `₹${Number(value ?? 0).toLocaleString("en-IN")}`,
                "Revenue",
              ]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5" }}
            />
            <Bar dataKey="revenue" fill="#ff2e6d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
