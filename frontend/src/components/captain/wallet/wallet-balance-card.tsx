import CaptainActionButton from "@/components/captain/shared/captain-action-button";
import CaptainCard from "@/components/captain/shared/captain-card";
import { captainHeading } from "@/lib/captain/captain-styles";

export default function WalletBalanceCard() {
  return (
    <CaptainCard className="bg-gradient-to-br from-white to-neutral-50">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        Available balance
      </p>
      <p className="mt-1 text-3xl font-bold text-neutral-900">₹8,420</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <CaptainActionButton size="default" className="h-10">
          Withdraw
        </CaptainActionButton>
        <CaptainActionButton
          variant="outline"
          size="default"
          className="h-10 border-neutral-300"
        >
          Add bank
        </CaptainActionButton>
      </div>
      <p className={`${captainHeading} mt-4 text-xs font-normal text-neutral-500`}>
        Next payout scheduled for Friday
      </p>
    </CaptainCard>
  );
}
