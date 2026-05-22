import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import CaptainRideHistoryList from "@/components/captain/history/captain-ride-history-list";

export default function CaptainRideHistoryPage() {
  return (
    <CaptainPageLayout
      title="Ride history"
      description="View completed and cancelled trips."
    >
      <CaptainRideHistoryList />
    </CaptainPageLayout>
  );
}
