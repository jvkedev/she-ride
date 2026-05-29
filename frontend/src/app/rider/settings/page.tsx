import RiderPageLayout from "@/components/rider/layout/rider-page-layout";
import SettingsPanel from "@/components/rider/settings/settings-panel";

export default function RiderSettingsPage() {
  return (
    <RiderPageLayout title="Settings">
      <SettingsPanel />
    </RiderPageLayout>
  );
}
