import RiderPageLayout from "@/components/rider/layout/rider-page-layout";
import RiderProfileClient from "@/components/rider/profile/rider-profile-client";

export default function RiderProfilePage() {
  return (
    <RiderPageLayout title="Profile">
      <RiderProfileClient />
    </RiderPageLayout>
  );
}
