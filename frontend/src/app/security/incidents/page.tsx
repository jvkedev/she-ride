import IncidentsTable from "@/components/security/incidents/incidents-table";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function SecurityIncidentsPage() {
  return (
    <DashboardPageLayout
      title="Incident management"
      description="Investigate reports, evidence, and resolution timelines."
      wide
    >
      <IncidentsTable />
    </DashboardPageLayout>
  );
}
