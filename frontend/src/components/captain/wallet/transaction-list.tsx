import CaptainCard from "@/components/captain/shared/captain-card";
import { recentTransactions } from "@/lib/captain/captain-mock-data";
import { captainHeading } from "@/lib/captain/captain-styles";
import { cn } from "@/lib/utils";

export default function TransactionList() {
  return (
    <CaptainCard>
      <h2 className={captainHeading}>Recent transactions</h2>
      <ul className="mt-4 divide-y divide-neutral-100">
        {recentTransactions.map((tx) => (
          <li
            key={tx.id}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">{tx.label}</p>
              <p className="text-xs text-neutral-500">{tx.date}</p>
            </div>
            <p
              className={cn(
                "text-sm font-semibold",
                tx.type === "credit" ? "text-emerald-600" : "text-red-600",
              )}
            >
              {tx.type === "credit" ? "+" : "-"}₹
              {tx.amount.toLocaleString("en-IN")}
            </p>
          </li>
        ))}
      </ul>
    </CaptainCard>
  );
}
