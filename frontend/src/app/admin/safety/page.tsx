import SafetyQuickActions from "@/components/admin/safety/safety-quick-actions";
import SosAlertsTable from "@/components/admin/safety/sos-alerts-table";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function AdminSafetyPage() {
  return (
    <DashboardPageLayout
      title="SOS & safety center"
     
      wide
    >
      <SafetyQuickActions />
      <SosAlertsTable />
    </DashboardPageLayout>
  );
}
