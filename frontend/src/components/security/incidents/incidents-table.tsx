"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import PriorityBadge from "@/components/shared/security/priority-badge";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import { INCIDENT_STATUS_FILTERS } from "@/lib/security/constants";
import { securityIncidents } from "@/lib/security/mock-data";
import type { SecurityIncident } from "@/lib/security/types";
import { Button } from "@/components/ui/button";

export default function IncidentsTable() {
  const { search, setSearch, statusFilter, setStatusFilter, filtered } =
    useAdminFilters(securityIncidents, {
      searchKeys: ["id", "title", "reporter", "assignedTo"],
      statusKey: "status",
    });

  const columns = useMemo<ColumnDef<SecurityIncident>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <Link href={`/security/incidents/${row.original.id}`} className="font-medium text-primary hover:underline">
            {row.original.id}
          </Link>
        ),
      },
      { accessorKey: "title", header: "Title" },
      { accessorKey: "category", header: "Category" },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      { accessorKey: "assignedTo", header: "Assigned" },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" asChild>
            <Link href={`/security/incidents/${row.original.id}`}>Investigate</Link>
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <SearchToolbar
        searchPlaceholder="Search incidents..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={INCIDENT_STATUS_FILTERS}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
      />
      <DataTable columns={columns} data={filtered} pageSize={8} />
    </div>
  );
}
