"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import { adminRiders } from "@/lib/admin/mock-data";
import type { AdminRider } from "@/lib/admin/types";

export default function RidersTable() {
  const { search, setSearch, filtered } = useAdminFilters(adminRiders, {
    searchKeys: ["name", "phone", "email"],
    statusKey: "status",
  });

  const columns = useMemo<ColumnDef<AdminRider>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Rider",
        cell: ({ row }) => (
          <div>
            <Link
              href={`/admin/riders/${row.original.id}`}
              className="font-medium text-neutral-900 hover:text-primary"
            >
              {row.original.name}
            </Link>
            <p className="text-xs text-neutral-500">{row.original.email}</p>
          </div>
        ),
      },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "totalRides", header: "Rides" },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => row.original.rating.toFixed(2),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Link href={`/admin/riders/${row.original.id}`}>
              <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">
                View
              </Button>
            </Link>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 rounded-lg text-xs"
            >
              {row.original.status === "active" ? "Block" : "Unblock"}
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <SearchToolbar
        searchPlaceholder="Search riders..."
        searchValue={search}
        onSearchChange={setSearch}
      />
      <DataTable columns={columns} data={filtered} pageSize={8} />
    </div>
  );
}
