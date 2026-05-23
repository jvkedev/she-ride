import RiskZonesPanel from "@/components/security/zones/risk-zones-panel";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function SecurityZonesPage() {
  return (
    <DashboardPageLayout
      title="Risk zones & geo-fencing"
      
      wide
    >
      <RiskZonesPanel />
    </DashboardPageLayout>
  );
}
