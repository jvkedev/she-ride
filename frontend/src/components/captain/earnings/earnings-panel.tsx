"use client";

import { useEffect, useState } from "react";

import EarningsBreakdown from "@/components/captain/earnings/earnings-breakdown";
import EarningsChart from "@/components/captain/earnings/earnings-chart";
import EarningsSummary from "@/components/captain/earnings/earnings-summary";
import WeeklyStats from "@/components/captain/earnings/weekly-stats";
import {
  CaptainEarningsResponse,
  getCaptainEarnings,
} from "@/services/captain/captain-earnings.service";

export default function EarningsPanel() {
  const [data, setData] = useState<CaptainEarningsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCaptainEarnings()
      .then((result) => setData(result))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <EarningsSummary
        summary={data?.dailySummary}
        stats={data?.weekStats}
        loading={loading}
      />
      <EarningsChart data={data?.weekly} loading={loading} />
      <div className="grid gap-4 md:grid-cols-2">
        <WeeklyStats stats={data?.weekStats} loading={loading} />
        <EarningsBreakdown summary={data?.dailySummary} loading={loading} />
      </div>
    </div>
  );
}
