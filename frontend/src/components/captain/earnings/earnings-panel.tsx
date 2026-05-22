import EarningsBreakdown from "@/components/captain/earnings/earnings-breakdown";
import EarningsChart from "@/components/captain/earnings/earnings-chart";
import EarningsSummary from "@/components/captain/earnings/earnings-summary";
import WeeklyStats from "@/components/captain/earnings/weekly-stats";

export default function EarningsPanel() {
  return (
    <div className="space-y-4">
      <EarningsSummary />
      <EarningsChart />
      <div className="grid gap-4 md:grid-cols-2">
        <WeeklyStats />
        <EarningsBreakdown />
      </div>
    </div>
  );
}
