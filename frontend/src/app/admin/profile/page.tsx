import DashboardPageLayout from "@/components/shared/dashboard/page-layout";
import AdminProfilePanel from "@/components/admin/dashboard/admin-profile-panel";

export default function AdminProfilePage() {
  return (
    <DashboardPageLayout
      title="Profile"
      description="Your admin account details."
    >
      <AdminProfilePanel />
    </DashboardPageLayout>
  );
}
