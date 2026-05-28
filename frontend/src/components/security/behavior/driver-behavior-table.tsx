"use client";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import DataTable from "@/components/shared/dashboard/data-table";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCaptainList } from "@/hooks/security/use-driver-behavior";

export interface CaptainBehaviorRow {
  captainId: string;
  name: string;
  phone: string;
  isOnline: boolean;
  totalTrips: number;
  totalFlags: number;
  highSeverityFlags: number;
  aggressiveFlags: number;
  safetyScore: number;
  rating: number;
}

export default function DriverBehaviorTable() {
  const { data, isLoading } = useCaptainList();
  const rows: CaptainBehaviorRow[] = Array.isArray(data) ? data : [];

  const columns = useMemo<ColumnDef<CaptainBehaviorRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Driver",
        cell: ({ row }) => (
          <Link
            href={`/security/behavior/${row.original.captainId}`}
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
      { accessorKey: "totalFlags", header: "Total flags" },
      { accessorKey: "highSeverityFlags", header: "High severity" },
      { accessorKey: "aggressiveFlags", header: "Aggressive flags" },
      { accessorKey: "totalTrips", header: "Trips" },
      {
        accessorKey: "isOnline",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.isOnline ? "online" : "offline"} />
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
            <Link href={`/security/behavior/${row.original.captainId}`}>
              Profile
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 animate-pulse rounded-lg bg-neutral-100"
          />
        ))}
      </div>
    );
  }

  return <DataTable columns={columns} data={rows} pageSize={8} />;
}
