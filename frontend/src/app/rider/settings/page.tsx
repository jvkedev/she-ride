import RiderPageLayout from "@/components/rider/layout/rider-page-layout";
import RiderSettingsPanel from "@/components/rider/settings/rider-settings-panel";

export default function RiderSettingsPage() {
  return (
    <RiderPageLayout
      title="Settings"
      description="Notifications, privacy, and account options."
    >
      <RiderSettingsPanel />
    </RiderPageLayout>  );
}
