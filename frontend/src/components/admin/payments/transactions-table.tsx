"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import DataTable from "@/components/shared/dashboard/data-table";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { adminTransactions } from "@/lib/admin/mock-data";
import type { AdminTransaction } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export default function TransactionsTable() {
  const columns = useMemo<ColumnDef<AdminTransaction>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="capitalize">{row.original.type}</span>
        ),
      },
      { accessorKey: "party", header: "Party" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span
            className={cn(
              "font-medium",
              row.original.type === "refund" ? "text-red-600" : "text-neutral-900",
            )}
          >
            ₹{row.original.amount.toLocaleString("en-IN")}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      { accessorKey: "date", header: "Date" },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.type === "refund" && row.original.status === "pending" ? (
            <Button size="sm" className="h-8 rounded-lg text-xs">
              Process refund
            </Button>
          ) : null,
      },
    ],
    [],
  );

  return <DataTable columns={columns} data={adminTransactions} pageSize={8} />;
}
