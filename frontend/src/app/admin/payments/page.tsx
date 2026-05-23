import RevenueSummary from "@/components/admin/payments/revenue-summary";
import TransactionsTable from "@/components/admin/payments/transactions-table";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";

export default function AdminPaymentsPage() {
  return (
    <DashboardPageLayout
      title="Payments & earnings"
      description="Revenue analytics, payouts, and refund management."
      wide
    >
      <RevenueSummary />
      <TransactionsTable />
    </DashboardPageLayout>
  );
}
