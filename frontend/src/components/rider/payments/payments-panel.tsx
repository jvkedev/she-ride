import { CreditCard, Plus, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";

const methods = [
  { id: "cash", label: "Cash", detail: "Default", icon: CreditCard },
  { id: "wallet", label: "She Wallet", detail: "₹1,250.00", icon: Wallet },
  { id: "upi", label: "UPI", detail: "priya@upi", icon: CreditCard },
];

const transactions = [
  { id: "1", label: "Ride to Century Public School", amount: "-₹501.95", date: "Today" },
  { id: "2", label: "Wallet top-up", amount: "+₹500.00", date: "Yesterday" },
  { id: "3", label: "Ride to Saket", amount: "-₹206.11", date: "12 May" },
];

export default function PaymentsPanel() {
  return (
    <>
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Wallet balance
        </p>
        <p className="mt-1 text-3xl font-semibold text-neutral-900">₹1,250.00</p>
        <Button className="mt-4 h-10 rounded-lg bg-primary font-medium hover:bg-primary/90">
          Add money
        </Button>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            Payment methods
          </h2>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {methods.map((method) => {
            const Icon = method.icon;
            return (
              <li
                key={method.id}
                className="flex items-center gap-3 rounded-lg border border-neutral-100 px-3 py-3"
              >
                <Icon className="size-4 text-neutral-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    {method.label}
                  </p>
                  <p className="text-xs text-neutral-500">{method.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">
          Recent transactions
        </h2>
        <ul className="divide-y divide-neutral-100">
          {transactions.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">{tx.label}</p>
                <p className="text-xs text-neutral-500">{tx.date}</p>
              </div>
              <p
                className={
                  tx.amount.startsWith("+")
                    ? "text-sm font-semibold text-[#2e7d32]"
                    : "text-sm font-semibold text-neutral-900"
                }
              >
                {tx.amount}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
