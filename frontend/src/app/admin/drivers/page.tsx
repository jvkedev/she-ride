import DriversTable from "@/components/admin/drivers/drivers-table";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function AdminDriversPage() {
  return (
    <DashboardPageLayout
      title="Driver management"
      description="Approve captains, verify KYC, and manage fleet status."
      wide
    >
      <DriversTable />
    </DashboardPageLayout>
  );
}
