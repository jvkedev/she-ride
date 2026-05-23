"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "@/components/shared/dashboard/chart-card";
import StatWidget from "@/components/shared/dashboard/stat-widget";
import { CircleDollarSign, TrendingUp, Wallet } from "lucide-react";
import { revenueChartData } from "@/lib/admin/mock-data";

export default function RevenueSummary() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatWidget
          label="Gross revenue"
          value="₹28.4L"
          icon={CircleDollarSign}
          accent="primary"
          trend={{ value: "+12.4%", positive: true }}
        />
        <StatWidget
          label="Driver payouts"
          value="₹21.2L"
          icon={Wallet}
        />
        <StatWidget
          label="Net platform"
          value="₹7.2L"
          icon={TrendingUp}
          accent="primary"
        />
      </div>
      <ChartCard title="Revenue trend" description="Daily platform revenue">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#ff2e6d"
              fill="#ff2e6d"
              fillOpacity={0.15}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
