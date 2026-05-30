"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, ReceiptText, Wallet } from "lucide-react";

import DataTable from "@/components/shared/dashboard/data-table";
import { Button } from "@/components/ui/button";
import {
  getDefaultPaymentMethod,
  getLastReceipt,
  getPaymentHistory,
  setDefaultPaymentMethod,
  type PaymentHistoryItem,
  type PaymentMethod,
} from "@/services/rider/payments.service";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function PaymentStatusPill({
  status,
}: {
  status: PaymentHistoryItem["status"];
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        status === "PAID"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {status === "PAID" ? "Paid" : "Pending"}
    </span>
  );
}

const METHODS: PaymentMethod[] = ["CASH", "UPI", "CARD"];

export default function PaymentsPanel() {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [defaultMethod, setDefaultMethod] = useState<PaymentMethod>("CASH");
  const [lastReceipt, setLastReceipt] = useState<{
    id: string;
    pickupAddress: string;
    dropAddress: string;
    fare: number;
    completedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingMethod, setSavingMethod] = useState(false);

  useEffect(() => {
    Promise.all([
      getPaymentHistory(1, 20),
      getDefaultPaymentMethod(),
      getLastReceipt(),
    ])
      .then(([history, method, receipt]) => {
        setPaymentHistory(history.data);
        setDefaultMethod(method.method);
        setLastReceipt(receipt);
      })
      .catch(() => setError("Unable to load payment data"))
      .finally(() => setLoading(false));
  }, []);

  async function handleMethodChange(method: PaymentMethod) {
    setSavingMethod(true);
    try {
      await setDefaultPaymentMethod(method);
      setDefaultMethod(method);
    } finally {
      setSavingMethod(false);
    }
  }

  const columns = useMemo<ColumnDef<PaymentHistoryItem>[]>(
    () => [
      {
        accessorKey: "route",
        header: "Route",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-neutral-900">{row.original.route}</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {row.original.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => (
          <span className="capitalize text-neutral-700">
            {row.original.method.toLowerCase()}
          </span>
        ),
      },
      {
        accessorKey: "fare",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-semibold text-neutral-900">
            ₹{row.original.fare.toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <PaymentStatusPill status={row.original.status} />,
      },
      {
        accessorKey: "completedAt",
        header: "Completed",
        cell: ({ row }) => (
          <span className="text-neutral-600">
            {formatDate(row.original.completedAt)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Wallet className="size-5 text-primary" />
          <h2 className="text-sm font-semibold text-neutral-900">
            Default payment method
          </h2>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Used when you book your next ride.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <Button
              key={m}
              type="button"
              size="sm"
              variant={defaultMethod === m ? "default" : "outline"}
              disabled={savingMethod || loading}
              onClick={() => void handleMethodChange(m)}
            >
              {m}
            </Button>
          ))}
        </div>
      </section>

      {lastReceipt && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-5 text-neutral-600" />
            <h2 className="text-sm font-semibold text-neutral-900">
              Last receipt
            </h2>
          </div>
          <p className="mt-2 text-sm text-neutral-700">
            {lastReceipt.pickupAddress} → {lastReceipt.dropAddress}
          </p>
          <p className="mt-1 text-lg font-semibold text-neutral-900">
            ₹{lastReceipt.fare.toFixed(2)}
          </p>
          <p className="text-xs text-neutral-500">
            {formatDate(lastReceipt.completedAt)}
          </p>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              Payment history
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Completed ride payments from your account.
            </p>
          </div>
          {loading ? (
            <Loader2 className="size-4 animate-spin text-neutral-400" />
          ) : null}
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : paymentHistory.length > 0 ? (
          <DataTable
            columns={columns}
            data={paymentHistory}
            pageSize={8}
            emptyMessage="No payment history found."
          />
        ) : loading ? (
          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-8 text-center text-sm text-neutral-500">
            Loading payments...
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-12 text-center">
            <ReceiptText className="mb-2 size-7 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-600">
              No payment history yet
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Your completed ride payments will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
