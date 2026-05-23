import RiderPageLayout from "@/components/rider/layout/rider-page-layout";
import RiderHelpCategories from "@/components/rider/support/rider-help-categories";
import RiderActionButton from "@/components/rider/shared/rider-action-button";
import RiderCard from "@/components/rider/shared/rider-card";

export default function RiderSupportPage() {
  return (
    <RiderPageLayout title="Support">
      <RiderHelpCategories />
      <RiderCard>
        <p className="text-sm text-neutral-600">
          Need urgent help? Our rider support team is available 24/7 for trip
          and safety issues.
        </p>
        <RiderActionButton fullWidth className="mt-4">
          Contact support
        </RiderActionButton>
      </RiderCard>
    </RiderPageLayout>
  );
}
