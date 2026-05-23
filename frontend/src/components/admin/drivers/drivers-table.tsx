"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import { DRIVER_STATUS_FILTERS } from "@/lib/admin/constants";
import { adminDrivers } from "@/lib/admin/mock-data";
import type { AdminDriver } from "@/lib/admin/types";

type DriversTableProps = {
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
};

export default function DriversTable({ onApprove, onReject }: DriversTableProps) {
  const { search, setSearch, statusFilter, setStatusFilter, filtered } =
    useAdminFilters(adminDrivers, {
      searchKeys: ["name", "phone", "vehicle", "plate"],
      statusKey: "kycStatus",
    });

  const columns = useMemo<ColumnDef<AdminDriver>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Driver",
        cell: ({ row }) => (
          <div>
            <Link
              href={`/admin/drivers/${row.original.id}`}
              className="font-medium text-neutral-900 hover:text-primary"
            >
              {row.original.name}
            </Link>
            <p className="text-xs text-neutral-500">{row.original.phone}</p>
          </div>
        ),
      },
      { accessorKey: "vehicle", header: "Vehicle" },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) =>
          row.original.rating > 0 ? row.original.rating.toFixed(2) : "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "kycStatus",
        header: "KYC",
        cell: ({ row }) => <StatusBadge status={row.original.kycStatus} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) =>
          row.original.kycStatus === "pending" ? (
            <div className="flex gap-1">
              <Button
                size="sm"
                className="h-8 rounded-lg text-xs"
                onClick={() => onApprove?.(row.original.id)}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg text-xs"
                onClick={() => onReject?.(row.original.id)}
              >
                Reject
              </Button>
            </div>
          ) : (
            <Link href={`/admin/drivers/${row.original.id}`}>
              <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">
                View
              </Button>
            </Link>
          ),
      },
    ],
    [onApprove, onReject],
  );

  return (
    <div className="space-y-4">
      <SearchToolbar
        searchPlaceholder="Search drivers..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={DRIVER_STATUS_FILTERS}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
      />
      <DataTable columns={columns} data={filtered} pageSize={8} />
    </div>
  );
}
