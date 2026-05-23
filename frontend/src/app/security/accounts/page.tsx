import AccountsSecurityTable from "@/components/security/accounts/accounts-security-table";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function SecurityAccountsPage() {
  return (
    <DashboardPageLayout
      title="Account security"
  
      wide
    >
      <AccountsSecurityTable />
    </DashboardPageLayout>
  );
}
