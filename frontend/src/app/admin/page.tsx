import OverviewStats from "@/components/admin/dashboard/overview-stats";
import RecentActivityFeed from "@/components/admin/dashboard/recent-activity-feed";
import RevenueChart from "@/components/admin/dashboard/revenue-chart";
import RidesChart from "@/components/admin/dashboard/rides-chart";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function AdminDashboardPage() {
  return (
    <DashboardPageLayout title="Dashboard" wide>
      <OverviewStats />
      <div className="grid gap-4 lg:grid-cols-2">
        <RevenueChart />
        <RidesChart />
      </div>
      <RecentActivityFeed />
    </DashboardPageLayout>
  );
}
