"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import RideDetailDrawer from "@/components/admin/rides/ride-detail-drawer";
import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import { RIDE_STATUS_FILTERS } from "@/lib/admin/constants";
import type { AdminRide } from "@/lib/admin/types";
import { fetchRides } from "@/services/admin/admin.service";

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-100 bg-red-50 py-12">
      <AlertTriangle className="size-5 text-red-400" />
      <p className="text-sm text-red-600">{message}</p>
      <Button
        size="sm"
        variant="outline"
        onClick={onRetry}
        className="gap-1.5 text-xs"
      >
        <RefreshCw className="size-3.5" /> Retry
      </Button>
    </div>
  );
}

export default function RidesTable() {
  const [rides, setRides] = useState<AdminRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRide, setSelectedRide] = useState<AdminRide | null>(null);

  const loadRides = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchRides();
      setRides(data);
    } catch (loadError) {
      console.error("Error fetching rides:", loadError);
      setError("Failed to load rides. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  const { search, setSearch, statusFilter, setStatusFilter, filtered } =
    useAdminFilters(rides, {
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
          <span className="max-w-50 truncate text-xs">
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

  if (loading) {
    return <div className="text-center py-8">Loading rides...</div>;
  }

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
        {error ? (
          <ErrorState message={error} onRetry={loadRides} />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            pageSize={8}
            emptyMessage="No rides found."
          />
        )}
      </div>
      <RideDetailDrawer
        ride={selectedRide}
        open={!!selectedRide}
        onOpenChange={(open) => !open && setSelectedRide(null)}
      />
    </>
  );
}
