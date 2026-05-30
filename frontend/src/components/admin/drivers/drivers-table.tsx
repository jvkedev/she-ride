"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import { DRIVER_STATUS_FILTERS } from "@/lib/admin/constants";
import type { AdminDriver } from "@/lib/admin/types";
import { fetchDrivers } from "@/services/admin/admin.service";

type DriversTableProps = {
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
};

export default function DriversTable({
  onApprove: _onApprove,
  onReject: _onReject,
}: DriversTableProps) {
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDrivers();
      setDrivers(data);
    } catch (fetchError) {
      console.error("Error fetching drivers:", fetchError);
      setError("Failed to load drivers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const { search, setSearch, statusFilter, setStatusFilter, filtered } =
    useAdminFilters(drivers, {
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
        cell: ({ row }) => (
          <Link href={`/admin/drivers/${row.original.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-lg text-xs"
            >
              {row.original.kycStatus === "pending" ? "Review KYC" : "View"}
            </Button>
          </Link>
        ),
      },
    ],
    [],
  );

  if (loading) {
    return <div className="text-center py-8">Loading drivers...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-red-100 bg-red-50 py-12">
        <p className="text-sm text-red-600">{error}</p>
        <Button size="sm" variant="outline" onClick={loadDrivers}>
          Retry
        </Button>
      </div>
    );
  }

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
