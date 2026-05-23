"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import DataTable from "@/components/shared/dashboard/data-table";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { driverBehavior } from "@/lib/security/mock-data";
import type { DriverBehaviorProfile } from "@/lib/security/types";
import { cn } from "@/lib/utils";

export default function DriverBehaviorTable() {
  const columns = useMemo<ColumnDef<DriverBehaviorProfile>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Driver",
        cell: ({ row }) => (
          <Link
            href={`/security/behavior/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "safetyScore",
        header: "Safety score",
        cell: ({ row }) => (
          <span
            className={cn(
              "font-bold tabular-nums",
              row.original.safetyScore >= 80
                ? "text-emerald-600"
                : row.original.safetyScore >= 70
                  ? "text-amber-600"
                  : "text-red-600",
            )}
          >
            {row.original.safetyScore}
          </span>
        ),
      },
      { accessorKey: "complaints", header: "Complaints" },
      { accessorKey: "cancellations", header: "Cancellations" },
      { accessorKey: "aggressiveFlags", header: "Aggressive flags" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" asChild>
            <Link href={`/security/behavior/${row.original.id}`}>Profile</Link>
          </Button>
        ),
      },
    ],
    [],
  );

  return <DataTable columns={columns} data={driverBehavior} pageSize={8} />;
}
