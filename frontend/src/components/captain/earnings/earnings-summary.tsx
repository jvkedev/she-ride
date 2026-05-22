import { IndianRupee, TrendingUp } from "lucide-react";

import CaptainStatWidget from "@/components/captain/shared/captain-stat-widget";
import { todayEarningsSummary } from "@/lib/captain/captain-mock-data";

export default function EarningsSummary() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <CaptainStatWidget
        label="Today"
        value={`₹${todayEarningsSummary.total.toLocaleString("en-IN")}`}
        icon={IndianRupee}
        accent="primary"
      />
      <CaptainStatWidget
        label="This week"
        value="₹17,950"
        hint="+12% vs last week"
        icon={TrendingUp}
        accent="primary"
      />
      <CaptainStatWidget
        label="Net payout"
        value={`₹${todayEarningsSummary.netPayout.toLocaleString("en-IN")}`}
        hint="After platform fees"
        icon={IndianRupee}
      />
    </div>
  );
}
