import SecurityPageLayout from "@/components/security/layout/security-page-layout";
import SecurityProfilePanel from "@/components/security/profile/security-profile-panel";

export default function SecurityProfilePage() {
  return (
    <SecurityPageLayout
      title="Profile"
      description="Your security account details."
    >
      <SecurityProfilePanel />
    </SecurityPageLayout>
  );
}
