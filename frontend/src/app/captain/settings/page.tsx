import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import AppPreferences from "@/components/captain/settings/app-preferences";

export default function CaptainSettingsPage() {
  return (
    <CaptainPageLayout
      title="Settings"
      description="Notifications, preferences, and account options."
    >
      <AppPreferences />
    </CaptainPageLayout>
  );
}
