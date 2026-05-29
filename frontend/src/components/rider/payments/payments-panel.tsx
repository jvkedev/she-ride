"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, ReceiptText } from "lucide-react";

import DataTable from "@/components/shared/dashboard/data-table";

type PaymentMethod = "CASH" | "UPI";
type PaymentStatus = "PAID" | "PENDING";

type PaymentHistoryItem = {
  id: string;
  route: string;
  pickupAddress: string;
  dropAddress: string;
  fare: number;
  method: PaymentMethod;
  status: PaymentStatus;
  completedAt: string;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchPaymentHistory(): Promise<PaymentHistoryItem[]> {
  const res = await fetch(`${API}/rider/payments/history`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    throw new Error(text);
  }

  return res.json();
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function PaymentStatusPill({ status }: { status: PaymentStatus }) {
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-12 text-center">
      <ReceiptText className="mb-2 size-7 text-neutral-300" />

      <p className="text-sm font-medium text-neutral-600">
        No payment history yet
      </p>

      <p className="mt-1 text-xs text-neutral-400">
        Your completed ride payments will appear here.
      </p>
    </div>
  );
}

export default function PaymentsPanel() {
  const {
    data: paymentHistory = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rider", "payments", "history"],
    queryFn: fetchPaymentHistory,
  });

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
            Rs {row.original.fare.toLocaleString("en-IN")}
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

          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-neutral-400" />
          ) : null}
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Unable to load payment history.
          </div>
        ) : paymentHistory.length > 0 ? (
          <DataTable
            columns={columns}
            data={paymentHistory}
            pageSize={8}
            emptyMessage="No payment history found."
          />
        ) : isLoading ? (
          <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-8 text-center text-sm text-neutral-500">
            Loading payments...
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </div>
  );
}
