import VerificationDashboard from "@/components/security/verification/verification-dashboard";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function SecurityVerificationPage() {
  return (
    <DashboardPageLayout
      title="Driver verification security"
      description="KYC review, document verification, and approve/reject workflows."
      wide
    >
      <VerificationDashboard />
    </DashboardPageLayout>
  );
}
