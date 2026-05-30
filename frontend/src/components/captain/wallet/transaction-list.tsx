import CaptainCard from "@/components/captain/shared/captain-card";
import { captainHeading } from "@/lib/captain/captain-styles";

export default function TransactionList() {
  return (
    <CaptainCard>
      <h2 className={captainHeading}>Recent transactions</h2>
      <p className="mt-4 text-sm text-neutral-500">
        No wallet transactions yet. Completed ride earnings will appear here.
      </p>
    </CaptainCard>
  );
}
