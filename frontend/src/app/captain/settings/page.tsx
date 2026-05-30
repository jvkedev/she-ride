import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import CaptainSettingsPanel from "@/components/captain/settings/captain-settings-panel";

export default function CaptainSettingsPage() {
  return (
    <CaptainPageLayout title="Settings">
      <CaptainSettingsPanel />
    </CaptainPageLayout>
  );
}
