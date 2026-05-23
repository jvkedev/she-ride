import DriversTable from "@/components/admin/drivers/drivers-table";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function AdminDriversPage() {
  return (
    <DashboardPageLayout title="Driver management" wide>
      <DriversTable />
    </DashboardPageLayout>
  );
}
