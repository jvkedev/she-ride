"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import DataTable from "@/components/shared/dashboard/data-table";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { fetchPayments } from "@/services/admin/admin.service";
import type { AdminPayment } from "@/lib/admin/types";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TransactionsTable() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await fetchPayments();
        setPayments(data);
      } catch (error) {
        console.error("Failed to load payments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const columns = useMemo<ColumnDef<AdminPayment>[]>(
    () => [
      { accessorKey: "rideId", header: "Ride ID" },
      { accessorKey: "riderName", header: "Rider" },
      { accessorKey: "driverName", header: "Driver" },
      {
        accessorKey: "tripAmount",
        header: "Trip Amount",
        cell: ({ row }) => (
          <span className="font-medium text-neutral-900">
            ₹{row.original.tripAmount.toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: "Method",
        cell: ({ row }) => (
          <span className="capitalize">
            {row.original.paymentMethod.toLowerCase()}
          </span>
        ),
      },
      {
        accessorKey: "completedAt",
        header: "Completed At",
        cell: ({ row }) => formatDate(row.original.completedAt),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  if (loading) {
    return <div className="py-6 text-center text-sm text-neutral-500">Loading completed ride payments...</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={payments}
      pageSize={8}
      emptyMessage="No completed ride payments found."
    />
  );
}
