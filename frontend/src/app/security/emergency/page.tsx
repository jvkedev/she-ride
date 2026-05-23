import EmergencyResponsePanel from "@/components/security/emergency/emergency-response-panel";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function SecurityEmergencyPage() {
  return (
    <DashboardPageLayout title="Emergency response center" wide>
      <EmergencyResponsePanel />
    </DashboardPageLayout>
  );
}
