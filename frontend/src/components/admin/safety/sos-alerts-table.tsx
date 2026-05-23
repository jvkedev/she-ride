"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import DataTable from "@/components/shared/dashboard/data-table";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { adminSosAlerts } from "@/lib/admin/mock-data";
import type { AdminSosAlert } from "@/lib/admin/types";

export default function SosAlertsTable() {
  const columns = useMemo<ColumnDef<AdminSosAlert>[]>(
    () => [
      { accessorKey: "rideId", header: "Ride" },
      { accessorKey: "riderName", header: "Rider" },
      { accessorKey: "driverName", header: "Driver" },
      { accessorKey: "location", header: "Location" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      { accessorKey: "triggeredAt", header: "Time" },
      {
        id: "actions",
        header: "Actions",
        cell: () => (
          <div className="flex gap-1">
            <Button size="sm" className="h-8 rounded-lg text-xs">
              Monitor
            </Button>
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">
              Resolve
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return <DataTable columns={columns} data={adminSosAlerts} pageSize={5} />;
}
