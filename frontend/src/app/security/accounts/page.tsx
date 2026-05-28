import AccountsSecurityTable from "@/components/security/accounts/accounts-security-table";
import FlagAccountDialog from "@/components/security/accounts/flag-account-dialog";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function SecurityAccountsPage() {
  return (
    <DashboardPageLayout
      title="Account security"
      actions={<FlagAccountDialog />}
      wide
    >
      <AccountsSecurityTable />
    </DashboardPageLayout>
  );
}
