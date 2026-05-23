import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import HelpCategories from "@/components/captain/support/help-categories";
import CaptainCard from "@/components/captain/shared/captain-card";
import CaptainActionButton from "@/components/captain/shared/captain-action-button";

export default function CaptainSupportPage() {
  return (
    <CaptainPageLayout
      title="Support"
    
    >
      <HelpCategories />
      <CaptainCard>
        <p className="text-sm text-neutral-600">
          Need urgent help? Our captain support line is available 24/7.
        </p>
        <CaptainActionButton fullWidth className="mt-4">
          Contact support
        </CaptainActionButton>
      </CaptainCard>
    </CaptainPageLayout>
  );
}
