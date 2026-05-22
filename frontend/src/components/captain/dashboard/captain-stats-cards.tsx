import { Clock, IndianRupee, Star, TrendingUp } from "lucide-react";

import CaptainStatWidget from "@/components/captain/shared/captain-stat-widget";
import { todayStats } from "@/lib/captain/captain-mock-data";

export default function CaptainStatsCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <CaptainStatWidget
        label="Trips today"
        value={String(todayStats.trips)}
        hint="4 more than yesterday"
        icon={TrendingUp}
        accent="primary"
      />
      <CaptainStatWidget
        label="Earnings today"
        value={`₹${todayStats.earnings.toLocaleString("en-IN")}`}
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
