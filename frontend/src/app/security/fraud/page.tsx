import FraudAlertsTable from "@/components/security/fraud/fraud-alerts-table";
import FraudRiskCards from "@/components/security/fraud/fraud-risk-cards";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function SecurityFraudPage() {
  return (
    <DashboardPageLayout
      title="Fraud detection"
     
      wide
    >
      <FraudRiskCards />
      <FraudAlertsTable />
    </DashboardPageLayout>
  );
}
