"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import { TICKET_STATUS_FILTERS } from "@/lib/admin/constants";
import { adminTickets } from "@/lib/admin/mock-data";
import type { AdminTicket } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

export default function TicketsTable() {
  const { search, setSearch, statusFilter, setStatusFilter, filtered } =
    useAdminFilters(adminTickets, {
      searchKeys: ["id", "subject", "user"],
      statusKey: "status",
    });

  const columns = useMemo<ColumnDef<AdminTicket>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Ticket",
        cell: ({ row }) => (
          <Link
            href={`/admin/support/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.id}
          </Link>
        ),
      },
      { accessorKey: "subject", header: "Subject" },
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => (
          <span>
            {row.original.user}
            <span className="ml-1 text-xs text-neutral-400 capitalize">
              ({row.original.role})
            </span>
          </span>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <span
            className={cn(
              "text-xs font-medium capitalize",
              row.original.priority === "high" && "text-red-600",
              row.original.priority === "medium" && "text-amber-600",
              row.original.priority === "low" && "text-neutral-500",
            )}
          >
            {row.original.priority}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      { accessorKey: "updatedAt", header: "Updated" },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Link href={`/admin/support/${row.original.id}`}>
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">
              Open
            </Button>
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <SearchToolbar
        searchPlaceholder="Search tickets..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={TICKET_STATUS_FILTERS}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
      />
      <DataTable columns={columns} data={filtered} pageSize={8} />
    </div>
  );
}
