"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import RiskScoreBadge from "@/components/shared/security/risk-score-badge";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import { FRAUD_TYPE_LABELS } from "@/lib/security/constants";
import { fraudAlerts } from "@/lib/security/mock-data";
import type { FraudAlert } from "@/lib/security/types";

export default function FraudAlertsTable() {
  const { search, setSearch, filtered } = useAdminFilters(fraudAlerts, {
    searchKeys: ["user", "device", "ip", "id"],
  });

  const columns = useMemo<ColumnDef<FraudAlert>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => FRAUD_TYPE_LABELS[row.original.type] ?? row.original.type,
      },
      { accessorKey: "user", header: "User" },
      {
        accessorKey: "riskScore",
        header: "Risk",
        cell: ({ row }) => <RiskScoreBadge score={row.original.riskScore} />,
      },
      { accessorKey: "device", header: "Device" },
      { accessorKey: "ip", header: "IP" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      { accessorKey: "detectedAt", header: "Detected" },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <SearchToolbar
        searchPlaceholder="Search fraud alerts..."
        searchValue={search}
        onSearchChange={setSearch}
      />
      <DataTable columns={columns} data={filtered} pageSize={8} />
    </div>
  );
}
