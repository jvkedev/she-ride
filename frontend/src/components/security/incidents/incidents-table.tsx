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
import { useIncidents } from "@/hooks/security/use-incidents";
import type { SecurityIncident } from "@/lib/security/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/shared/dashboard/loading-skeleton";
import type { DashboardStatus } from "@/components/shared/dashboard/status-badge";
import { AlertCircle } from "lucide-react";

// ── Loading skeleton ──────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

function TableError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>Failed to load incidents: {message}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function IncidentsTable() {
  // 1. Fetch from API — no mock data
  const { data: incidents = [], isLoading, error } = useIncidents();

  // 2. Client-side search + status filter (same hook, real data)
  const { search, setSearch, statusFilter, setStatusFilter, filtered } =
    useAdminFilters(incidents, {
      searchKeys: ["id", "title", "reporter", "assignedTo"],
      statusKey: "status",
    });

  const columns = useMemo<ColumnDef<SecurityIncident>[]>(
    () => [
      {
        accessorKey: "incidentNumber",
        header: "Incident #",
        cell: ({ row }) => (
          <Link
            href={`/security/incidents/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.incidentNumber ?? row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "incidentType",
        header: "Type",
        cell: ({ row }) => (
          <span className="text-sm text-neutral-700">
            {row.original.incidentType?.replace(/_/g, " ") ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => (
          <StatusBadge status={row.original.severity as DashboardStatus} />
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status as DashboardStatus} />
        ),
      },
      {
        accessorKey: "assignedUser",
        header: "Assigned",
        cell: ({ row }) => (
          <span className="text-sm text-neutral-600">
            {row.original.assignedUser?.fullName ?? "Unassigned"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Reported",
        cell: ({ row }) => (
          <span className="text-xs text-neutral-500">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg text-xs"
            asChild
          >
            <Link href={`/security/incidents/${row.original.id}`}>
              Investigate
            </Link>
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

      {isLoading && <TableSkeleton />}
      {error && <TableError message={(error as Error).message} />}
      {!isLoading && !error && (
        <DataTable<SecurityIncident>
          columns={columns}
          data={filtered}
          pageSize={8}
        />
      )}
    </div>
  );
}
