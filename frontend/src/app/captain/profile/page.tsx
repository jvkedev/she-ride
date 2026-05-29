import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import CaptainProfilePanel from "@/components/captain/dashboard/captain-profile-panel";

export default function CaptainProfilePage() {
  return (
    <CaptainPageLayout
      title="Profile"
      description="Your captain account details."
    >
      <CaptainProfilePanel />
    </CaptainPageLayout>
  );
}
