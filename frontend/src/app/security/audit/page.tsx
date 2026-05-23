import AuditLogsTable from "@/components/security/audit/audit-logs-table";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function SecurityAuditPage() {
  return (
    <DashboardPageLayout
      title="Audit logs"
   
      wide
    >
      <AuditLogsTable />
    </DashboardPageLayout>
  );
}
