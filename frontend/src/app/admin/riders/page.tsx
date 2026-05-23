import RidersTable from "@/components/admin/riders/riders-table";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function AdminRidersPage() {
  return (
    <DashboardPageLayout
      title="Rider management"
      description="View riders, ride history, and account actions."
      wide
    >
      <RidersTable />
    </DashboardPageLayout>
  );
}
