import FareSettingsForm from "@/components/admin/settings/fare-settings-form";
import PlatformSettingsForm from "@/components/admin/settings/platform-settings-form";
import RolesPanel from "@/components/admin/settings/roles-panel";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function AdminSettingsPage() {
  return (
    <DashboardPageLayout title="Settings" wide>
      <div className="grid gap-4 lg:grid-cols-2">
        <PlatformSettingsForm />
        <RolesPanel />
      </div>
      <FareSettingsForm />
    </DashboardPageLayout>
  );
}
