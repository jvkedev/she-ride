import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import CaptainProfileCard from "@/components/captain/profile/captain-profile-card";

export default function CaptainProfilePage() {
  return (
    <CaptainPageLayout title="Profile" description="Your captain account details.">
      <CaptainProfileCard />
    </CaptainPageLayout>
  );
}
