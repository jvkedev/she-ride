import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import EarningsBreakdown from "@/components/captain/earnings/earnings-breakdown";
import EarningsChart from "@/components/captain/earnings/earnings-chart";
import EarningsSummary from "@/components/captain/earnings/earnings-summary";
import WeeklyStats from "@/components/captain/earnings/weekly-stats";

export default function CaptainEarningsPage() {
  return (
    <CaptainPageLayout
      title="Earnings"
      wide
    >
      <EarningsSummary />
      <div className="grid gap-4 lg:grid-cols-2">
        <EarningsChart />
        <WeeklyStats />
      </div>
      <EarningsBreakdown />
    </CaptainPageLayout>
  );
}
