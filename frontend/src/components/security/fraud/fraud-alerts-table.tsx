// components/security/fraud/fraud-alerts-table.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import type { DashboardStatus } from "@/components/shared/dashboard/status-badge";
import RiskScoreBadge from "@/components/shared/security/risk-score-badge";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import { FRAUD_TYPE_LABELS } from "@/lib/security/constants";

import {
  useFraudCases,
  useUpdateFraudStatus,
  useBlockUser,
} from "@/lib/security/use-fraud";
import type {
  FraudCase,
  FraudStatus,
  FraudRiskLevel,
} from "@/lib/security/fraud-api";

// ─── Map backend SCREAMING_CASE → DashboardStatus (lowercase) ────────────────
// Adjust the right-hand values to whatever your DashboardStatus union accepts.

const STATUS_MAP: Record<FraudStatus, DashboardStatus> = {
  OPEN: "open",
  UNDER_REVIEW: "pending",
  RESOLVED: "completed",
  FALSE_POSITIVE: "cancelled",
};

// ─── Filter dropdown options ──────────────────────────────────────────────────

const STATUS_OPTIONS: { label: string; value: FraudStatus | "" }[] = [
  { label: "All statuses", value: "" },
  { label: "Open", value: "OPEN" },
  { label: "Under review", value: "UNDER_REVIEW" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "False positive", value: "FALSE_POSITIVE" },
];

const RISK_OPTIONS: { label: string; value: FraudRiskLevel | "" }[] = [
  { label: "All risk levels", value: "" },
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Critical", value: "CRITICAL" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function FraudAlertsTable() {
  const [statusFilter, setStatusFilter] = useState<FraudStatus | "">("");
  const [riskLevelFilter, setRiskLevelFilter] = useState<FraudRiskLevel | "">(
    "",
  );

  const {
    data: rawCases = [],
    isLoading,
    isError,
  } = useFraudCases({
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(riskLevelFilter ? { riskLevel: riskLevelFilter } : {}),
  });

  const updateStatus = useUpdateFraudStatus();
  const blockUser = useBlockUser();

  // Fix 1: cast to the generic Record type useAdminFilters expects,
  // then cast filtered back to FraudCase[] for DataTable.
  const {
    search,
    setSearch,
    filtered: filteredRaw,
  } = useAdminFilters(rawCases as unknown as Record<string, unknown>[], {
    searchKeys: ["id", "fraudType", "user.name", "user.email"],
  });
  const filtered = filteredRaw as unknown as FraudCase[];

  // ── Row actions ───────────────────────────────────────────────────────────

  const handleStatusChange = (
    id: string,
    status: "UNDER_REVIEW" | "RESOLVED" | "FALSE_POSITIVE",
  ) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () =>
          toast.success(
            `Case marked as ${status.toLowerCase().replace(/_/g, " ")}`,
          ),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  const handleBlock = (id: string) => {
    blockUser.mutate(id, {
      onSuccess: () => toast.success("User blocked successfully"),
      onError: (e) => toast.error((e as Error).message),
    });
  };

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<FraudCase>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.id.slice(0, 8)}…
          </span>
        ),
      },
      {
        accessorKey: "fraudType",
        header: "Type",
        cell: ({ row }) =>
          FRAUD_TYPE_LABELS[row.original.fraudType] ?? row.original.fraudType,
      },
      {
        id: "user",
        header: "User",
        accessorFn: (row) => row.user?.name ?? row.userId,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {row.original.user?.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.user?.email}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "fraudScore",
        header: "Risk",
        cell: ({ row }) => <RiskScoreBadge score={row.original.fraudScore} />,
      },
      {
        accessorKey: "riskLevel",
        header: "Level",
        cell: ({ row }) => (
          <span
            className={
              row.original.riskLevel === "CRITICAL"
                ? "text-destructive font-semibold"
                : row.original.riskLevel === "HIGH"
                  ? "text-orange-500 font-medium"
                  : "text-muted-foreground"
            }
          >
            {row.original.riskLevel}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        // Fix 2: map SCREAMING_CASE → DashboardStatus before passing to StatusBadge
        cell: ({ row }) => (
          <StatusBadge status={STATUS_MAP[row.original.status]} />
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Detected",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const { id, status } = row.original;
          const resolved = status === "RESOLVED" || status === "FALSE_POSITIVE";

          return (
            <div className="flex items-center gap-2">
              {!resolved && (
                <>
                  {status === "OPEN" && (
                    <button
                      className="text-xs text-blue-500 hover:underline disabled:opacity-50"
                      onClick={() => handleStatusChange(id, "UNDER_REVIEW")}
                      disabled={updateStatus.isPending}
                    >
                      Review
                    </button>
                  )}
                  <button
                    className="text-xs text-green-600 hover:underline disabled:opacity-50"
                    onClick={() => handleStatusChange(id, "RESOLVED")}
                    disabled={updateStatus.isPending}
                  >
                    Resolve
                  </button>
                  <button
                    className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
                    onClick={() => handleStatusChange(id, "FALSE_POSITIVE")}
                    disabled={updateStatus.isPending}
                  >
                    FP
                  </button>
                  <button
                    className="text-xs text-destructive hover:underline disabled:opacity-50"
                    onClick={() => handleBlock(id)}
                    disabled={blockUser.isPending}
                  >
                    Block
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateStatus.isPending, blockUser.isPending],
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchToolbar
          searchPlaceholder="Search fraud alerts…"
          searchValue={search}
          onSearchChange={setSearch}
        />

        <select
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FraudStatus | "")}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          className="h-9 rounded-md border bg-background px-2 text-sm"
          value={riskLevelFilter}
          onChange={(e) =>
            setRiskLevelFilter(e.target.value as FraudRiskLevel | "")
          }
        >
          {RISK_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isError && (
        <p className="text-sm text-destructive">
          Failed to load fraud cases. Check your connection or permissions.
        </p>
      )}

      {/* Fix 3: explicit generic so DataTable infers FraudCase[], not Record<string,unknown>[] */}
      <DataTable<FraudCase> columns={columns} data={filtered} pageSize={8} />
    </div>
  );
}
