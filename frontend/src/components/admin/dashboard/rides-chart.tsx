"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "@/components/shared/dashboard/chart-card";
import { revenueChartData } from "@/lib/admin/mock-data";

export default function RidesChart() {
  return (
    <ChartCard title="Ride volume" description="Completed trips per day">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={revenueChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5" }} />
          <Line
            type="monotone"
            dataKey="rides"
            stroke="#ff2e6d"
            strokeWidth={2}
            dot={{ fill: "#ff2e6d", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
