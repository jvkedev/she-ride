import RideHistoryPanel from "@/components/rider/history/ride-history-panel";
import RiderPageLayout from "@/components/rider/layout/rider-page-layout";

export default function RideHistoryPage() {
  return (
    <RiderPageLayout
      title="Ride History"
      description="Your past trips and receipts"
    >
      <RideHistoryPanel />
    </RiderPageLayout>
  );
}
