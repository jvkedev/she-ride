import VerificationDashboard from "@/components/security/verification/verification-dashboard";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function SecurityVerificationDriversPage() {
  return (
    <DashboardPageLayout
      title="Driver verification"
      description="Review driver documents, open a profile, and approve or reject submissions."
      wide
    >
      <VerificationDashboard />
    </DashboardPageLayout>
  );
}
