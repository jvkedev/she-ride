import AdminTeamPanel from "@/components/admin/settings/admin-team-panel";
import FareSettingsForm from "@/components/admin/settings/fare-settings-form";
import RolesPanel from "@/components/admin/settings/roles-panel";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function AdminSettingsPage() {
  return (
    <DashboardPageLayout title="Settings" wide>
      <div className="grid gap-4 lg:grid-cols-2">
        <RolesPanel />
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80 p-5 text-sm text-neutral-600">
          <p className="font-medium text-neutral-900">Roles vs organization</p>
          <p className="mt-2">
            <strong>Permission roles</strong> (Super Admin, Admin, Moderator,
            Support) control what an admin can do in the dashboard.
          </p>
          <p className="mt-2">
            <strong>Department</strong> and <strong>job title</strong> describe
            where someone works in the organization and do not replace
            authorization.
          </p>
        </div>
      </div>
      <AdminTeamPanel />
      <FareSettingsForm />
    </DashboardPageLayout>
  );
}
