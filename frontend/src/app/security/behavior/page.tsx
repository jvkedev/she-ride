import DriverBehaviorTable from "@/components/security/behavior/driver-behavior-table";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function SecurityBehaviorPage() {
  return (
    <DashboardPageLayout
      title="Driver behavior monitoring"
      description="Safety scores, complaints, and risk profiles."
      wide
    >
      <DriverBehaviorTable />
    </DashboardPageLayout>
  );
}
