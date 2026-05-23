import RidesTable from "@/components/admin/rides/rides-table";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function AdminRidesPage() {
  return (
    <DashboardPageLayout title="Ride management" wide>
      <RidesTable />
    </DashboardPageLayout>
  );
}
