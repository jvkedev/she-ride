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
import { securityChartData } from "@/lib/security/mock-data";

export default function SecurityAlertsChart() {
  return (
    <ChartCard title="Security alerts trend" description="SOS, fraud, and total alerts">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={securityChartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="alerts" stroke="#ff2e6d" strokeWidth={2} name="Total" />
          <Line type="monotone" dataKey="fraud" stroke="#f97316" strokeWidth={2} name="Fraud" />
          <Line type="monotone" dataKey="sos" stroke="#ef4444" strokeWidth={2} name="SOS" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
