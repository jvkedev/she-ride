import RiderAppPreferences from "@/components/rider/settings/rider-app-preferences";
import RiderPrivacySettings from "@/components/rider/settings/rider-privacy-settings";
import RiderCard from "@/components/rider/shared/rider-card";
import DashboardLogoutButton from "@/components/shared/dashboard/logout-button";

export default function RiderSettingsPanel() {
  return (
    <div className="space-y-4">
      <RiderAppPreferences />
      <RiderPrivacySettings />
      <RiderCard>
        <h2 className="text-sm font-semibold text-neutral-900">Account</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Sign out of She Ride on this device.
        </p>
        <DashboardLogoutButton className="mt-4" />
      </RiderCard>
    </div>
  );
}
