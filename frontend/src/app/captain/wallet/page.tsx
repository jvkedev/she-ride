import CaptainPageLayout from "@/components/captain/layout/captain-page-layout";
import TransactionList from "@/components/captain/wallet/transaction-list";
import WalletBalanceCard from "@/components/captain/wallet/wallet-balance-card";

export default function CaptainWalletPage() {
  return (
    <CaptainPageLayout
      title="Wallet"
      description="Manage balance, withdrawals, and transactions."
    >
      <WalletBalanceCard />
      <TransactionList />
    </CaptainPageLayout>
  );
}
