import RiderPageLayout from "@/components/rider/layout/rider-page-layout";
import TrackRidePanel from "@/components/rider/track/track-ride-panel";

export default function TrackRidePage() {
  return (
    <RiderPageLayout
      title="Track Ride"
      description="Live status of your active trip"
    >
      <TrackRidePanel />
    </RiderPageLayout>
  );
}
