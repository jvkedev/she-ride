"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
  fetchSecurityAlertsTrend,
  type SecurityAlertsTrendPoint,
} from "@/services/security/security-profile.service";

export default function SecurityAlertsChart() {
  const [data, setData] = useState<SecurityAlertsTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityAlertsTrend()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ChartCard title="Security alerts trend" description="SOS, fraud, and total alerts">
        <div className="flex h-[240px] items-center justify-center text-sm text-neutral-500">
          <Loader2 className="mr-2 size-4 animate-spin" />
          Loading trend…
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Security alerts trend" description="SOS, fraud, and total alerts">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="alerts"
            stroke="#ff2e6d"
            strokeWidth={2}
            name="Total"
          />
          <Line
            type="monotone"
            dataKey="fraud"
            stroke="#f97316"
            strokeWidth={2}
            name="Fraud"
          />
          <Line
            type="monotone"
            dataKey="sos"
            stroke="#ef4444"
            strokeWidth={2}
            name="SOS"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
