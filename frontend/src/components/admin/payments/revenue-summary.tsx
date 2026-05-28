"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CircleDollarSign, ReceiptText, TrendingUp } from "lucide-react";

import ChartCard from "@/components/shared/dashboard/chart-card";
import StatWidget from "@/components/shared/dashboard/stat-widget";
import {
  fetchPayments,
  fetchPaymentsTrend,
} from "@/services/admin/admin.service";
import type {
  AdminPayment,
  AdminPaymentTrendPoint,
} from "@/lib/admin/types";

export default function RevenueSummary() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [trend, setTrend] = useState<AdminPaymentTrendPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [paymentData, trendData] = await Promise.all([
          fetchPayments(),
          fetchPaymentsTrend(),
        ]);
        setPayments(paymentData);
        setTrend(trendData);
      } catch (error) {
        console.error("Failed to load payment summary:", error);
      }
    };

    load();
  }, []);

  const summary = useMemo(() => {
    const totalRevenue = payments.reduce(
      (sum, payment) => sum + payment.tripAmount,
      0,
    );
    const completedTrips = payments.length;
    const averageTripAmount =
      completedTrips > 0 ? totalRevenue / completedTrips : 0;
    const highestDay =
      trend.reduce<AdminPaymentTrendPoint | null>(
        (best, point) =>
          !best || point.tripAmount > best.tripAmount ? point : best,
        null,
      ) ?? null;

    return {
      totalRevenue,
      completedTrips,
      averageTripAmount,
      highestDay,
    };
  }, [payments, trend]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatWidget
          label="Gross revenue"
          value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
          icon={CircleDollarSign}
          accent="primary"
          hint="All completed ride payments"
        />
        <StatWidget
          label="Completed trips"
          value={summary.completedTrips.toString()}
          icon={ReceiptText}
          hint="Count of completed rides"
        />
        <StatWidget
          label="Average trip amount"
          value={`₹${summary.averageTripAmount.toLocaleString("en-IN")}`}
          icon={TrendingUp}
          accent="primary"
          hint={
            summary.highestDay
              ? `Top day: ${summary.highestDay.label}`
              : "Daily trip trend"
          }
        />
      </div>

      <ChartCard
        title="Trips & trip amount trend"
        description="Completed trips and their trip amount over the last 7 days"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={trend}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              tickFormatter={(value) => `₹${(Number(value) / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value, name) =>
                name === "trips"
                  ? [Number(value ?? 0).toString(), "Trips"]
                  : [
                      `₹${Number(value ?? 0).toLocaleString("en-IN")}`,
                      "Trip amount",
                    ]
              }
              contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5" }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="tripAmount"
              name="Trip amount"
              fill="#ff2e6d"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="trips"
              name="Trips"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
