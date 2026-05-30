import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import RequestList from "@/components/captain/requests/request-list";

export default function CaptainRequestsPage() {
  return (
    <CaptainPageLayout title="Ride requests" wide>
      <RequestList showTimer />
    </CaptainPageLayout>
  );
}
