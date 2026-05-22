import RiderPageLayout from "@/components/rider/layout/rider-page-layout";
import RiderProfileCard from "@/components/rider/profile/rider-profile-card";
import RiderProfileDetails from "@/components/rider/profile/rider-profile-details";

export default function RiderProfilePage() {
  return (
    <RiderPageLayout
      title="Profile"
      description="Your rider account details."
    >
      <RiderProfileCard />
      <RiderProfileDetails />
    </RiderPageLayout>
  );
}
