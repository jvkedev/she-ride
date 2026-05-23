"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import { Button } from "@/components/ui/button";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import { auditLogs } from "@/lib/security/mock-data";
import type { AuditLogEntry } from "@/lib/security/types";

export default function AuditLogsTable() {
  const { search, setSearch, filtered } = useAdminFilters(auditLogs, {
    searchKeys: ["actor", "action", "target", "ip"],
  });

  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      { accessorKey: "timestamp", header: "Time" },
      { accessorKey: "actor", header: "Actor" },
      { accessorKey: "action", header: "Action" },
      { accessorKey: "target", header: "Target" },
      { accessorKey: "ip", header: "IP" },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <SearchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search audit logs..."
      >
        <Button variant="outline" className="h-10 rounded-lg shrink-0">
          Export CSV
        </Button>
      </SearchToolbar>
      <DataTable columns={columns} data={filtered} pageSize={10} />
    </div>
  );
}
