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
import { revenueChartData } from "@/lib/admin/mock-data";

export default function RevenueChart() {
  return (
    <ChartCard title="Revenue overview" description="Last 7 days">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={revenueChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
    </ChartCard>
  );
}
