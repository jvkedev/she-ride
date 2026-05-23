import TicketsTable from "@/components/admin/support/tickets-table";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function AdminSupportPage() {
  return (
    <DashboardPageLayout
      title="Support tickets"
     
      wide
    >
      <TicketsTable />
    </DashboardPageLayout>
  );
}
