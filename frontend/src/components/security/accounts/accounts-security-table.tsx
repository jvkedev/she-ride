"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import { Button } from "@/components/ui/button";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import { accountEvents } from "@/lib/security/mock-data";
import type { AccountSecurityEvent } from "@/lib/security/types";
const typeLabels: Record<string, string> = {
  failed_login: "Failed login",
  new_device: "New device",
  vpn: "VPN / Proxy",
  session: "Active session",
};

export default function AccountsSecurityTable() {
  const { search, setSearch, filtered } = useAdminFilters(accountEvents, {
    searchKeys: ["user", "device", "ip", "location"],
  });

  const columns = useMemo<ColumnDef<AccountSecurityEvent>[]>(
    () => [
      { accessorKey: "user", header: "User" },
      {
        accessorKey: "type",
        header: "Event",
        cell: ({ row }) => typeLabels[row.original.type] ?? row.original.type,
      },
      { accessorKey: "device", header: "Device" },
      { accessorKey: "location", header: "Location" },
      { accessorKey: "ip", header: "IP" },
      { accessorKey: "time", header: "Time" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">
              Force logout
            </Button>
            <Button
              size="sm"
              variant={row.original.blocked ? "outline" : "destructive"}
              className="h-8 rounded-lg text-xs"
            >
              {row.original.blocked ? "Unblock" : "Lock"}
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <SearchToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search account events..." />
      <DataTable columns={columns} data={filtered} pageSize={8} />
    </div>
  );
}
