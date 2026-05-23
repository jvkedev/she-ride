"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import RideDetailDrawer from "@/components/admin/rides/ride-detail-drawer";
import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import { RIDE_STATUS_FILTERS } from "@/lib/admin/constants";
import { adminRides } from "@/lib/admin/mock-data";
import type { AdminRide } from "@/lib/admin/types";

export default function RidesTable() {
  const [selectedRide, setSelectedRide] = useState<AdminRide | null>(null);
  const { search, setSearch, statusFilter, setStatusFilter, filtered } =
    useAdminFilters(adminRides, {
      searchKeys: ["id", "riderName", "driverName", "pickup", "dropoff"],
      statusKey: "status",
    });

  const columns = useMemo<ColumnDef<AdminRide>[]>(
    () => [
      { accessorKey: "id", header: "Ride ID" },
      { accessorKey: "riderName", header: "Rider" },
      { accessorKey: "driverName", header: "Driver" },
      {
        accessorKey: "pickup",
        header: "Route",
        cell: ({ row }) => (
          <span className="max-w-[200px] truncate text-xs">
            {row.original.pickup} → {row.original.dropoff}
          </span>
        ),
      },
      {
        accessorKey: "fare",
        header: "Fare",
        cell: ({ row }) => `₹${row.original.fare}`,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg text-xs"
            onClick={() => setSelectedRide(row.original)}
          >
            Details
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <div className="space-y-4">
        <SearchToolbar
          searchPlaceholder="Search rides..."
          searchValue={search}
          onSearchChange={setSearch}
          filters={RIDE_STATUS_FILTERS}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
        />
        <DataTable columns={columns} data={filtered} pageSize={8} />
      </div>
      <RideDetailDrawer
        ride={selectedRide}
        open={!!selectedRide}
        onOpenChange={(open) => !open && setSelectedRide(null)}
      />
    </>
  );
}
