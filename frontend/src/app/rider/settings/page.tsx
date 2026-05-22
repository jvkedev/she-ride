import RiderPageLayout from "@/components/rider/layout/rider-page-layout";
import RiderAppPreferences from "@/components/rider/settings/rider-app-preferences";
import RiderPrivacySettings from "@/components/rider/settings/rider-privacy-settings";

export default function RiderSettingsPage() {
  return (
    <RiderPageLayout
      title="Settings"
      description="Notifications, preferences, and privacy options."
    >
      <RiderAppPreferences />
      <RiderPrivacySettings />
    </RiderPageLayout>
  );
}
