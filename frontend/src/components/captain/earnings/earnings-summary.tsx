import { IndianRupee, TrendingUp } from "lucide-react";

import CaptainStatWidget from "@/components/captain/shared/captain-stat-widget";
import {
  CaptainEarningsSummary,
  CaptainEarningsStats,
} from "@/services/captain/captain-earnings.service";

interface EarningsSummaryProps {
  summary?: CaptainEarningsSummary | null;
  stats?: CaptainEarningsStats | null;
  loading?: boolean;
}

export default function EarningsSummary({
  summary,
  stats,
  loading,
}: EarningsSummaryProps) {
  const total = summary?.total ?? 0;
  const netPayout = summary?.netPayout ?? 0;
  const weekTotal = stats?.weekTotal ?? 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <CaptainStatWidget
        label="Today"
        value={loading ? "Loading..." : `₹${total.toLocaleString("en-IN")}`}
        icon={IndianRupee}
        accent="primary"
      />
      <CaptainStatWidget
        label="This week"
        value={loading ? "—" : `₹${weekTotal.toLocaleString("en-IN")}`}
        hint="vs last week"
        icon={TrendingUp}
        accent="primary"
      />
      <CaptainStatWidget
        label="Net payout"
        value={loading ? "—" : `₹${netPayout.toLocaleString("en-IN")}`}
        icon={IndianRupee}
      />
    </div>
  );
}
