"use client";

import { useEffect, useState } from "react";
import { Clock, IndianRupee, Star, TrendingUp } from "lucide-react";

import CaptainStatWidget from "@/components/captain/shared/captain-stat-widget";
import {
  getCaptainEarnings,
  CaptainEarningsSummary,
} from "@/services/captain/captain-earnings.service";
import { todayStats } from "@/lib/captain/captain-mock-data";

export default function CaptainStatsCards() {
  const [summary, setSummary] = useState<CaptainEarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCaptainEarnings()
      .then((data) => setSummary(data.dailySummary))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <CaptainStatWidget
        label="Trips today"
        value={loading ? "Loading..." : String(summary?.trips ?? 0)}
        hint="4 more than yesterday"
        icon={TrendingUp}
        accent="primary"
      />
      <CaptainStatWidget
        label="Earnings today"
        value={
          loading
            ? "Loading..."
            : `₹${(summary?.total ?? 0).toLocaleString("en-IN")}`
        }
        hint="Including incentives"
        icon={IndianRupee}
        accent="primary"
      />
      <CaptainStatWidget
        label="Rating"
        value={todayStats.rating.toFixed(2)}
        hint="Last 50 trips"
        icon={Star}
      />
      <CaptainStatWidget
        label="Online hours"
        value={`${todayStats.onlineHours}h`}
        hint="Since 8:00 AM"
        icon={Clock}
      />
    </div>
  );
}
