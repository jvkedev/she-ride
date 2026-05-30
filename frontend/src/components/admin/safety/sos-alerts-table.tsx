"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

import DataTable from "@/components/shared/dashboard/data-table";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import type { AdminSosAlert } from "@/lib/admin/types";
import {
  fetchActiveSosAlerts,
  resolveSosAlert,
} from "@/services/admin/admin.service";

export default function SosAlertsTable() {
  const [alerts, setAlerts] = useState<AdminSosAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchActiveSosAlerts();
      setAlerts(data);
    } catch (error) {
      console.error("Failed to load SOS alerts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, [load]);

  const handleResolve = useCallback(
    async (id: string) => {
      setActionId(id);
      try {
        await resolveSosAlert(id, {
          status: "RESOLVED",
          resolutionNote: "Resolved by admin",
        });
        await load();
      } catch (error) {
        console.error("Resolve failed:", error);
      } finally {
        setActionId(null);
      }
    },
    [load],
  );

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
        cell: ({ row }) => {
          const busy = actionId === row.original.id;
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg text-xs"
                disabled={busy}
                onClick={() => handleResolve(row.original.id)}
              >
                {busy ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : (
                  "Resolve"
                )}
              </Button>
            </div>
          );
        },
      },
    ],
    [actionId, handleResolve],
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-neutral-500">
        <Loader2 className="size-4 animate-spin" />
        Loading SOS alerts…
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={alerts}
      pageSize={5}
      emptyMessage="No active SOS alerts."
    />
  );
}
