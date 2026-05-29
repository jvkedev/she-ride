import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import EarningsPanel from "@/components/captain/earnings/earnings-panel";

export default function CaptainEarningsPage() {
  return (
    <CaptainPageLayout title="Earnings" wide>
      <EarningsPanel />
    </CaptainPageLayout>
  );
}
