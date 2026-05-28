"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Download, RefreshCw } from "lucide-react";

import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import { Button } from "@/components/ui/button";
import { useAuditLogs } from "@/hooks/security/use-audit-logs";
import type { AuditLogEntry } from "@/lib/security/types";
import { cn } from "@/lib/utils";

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(rows: AuditLogEntry[]) {
  const header = ["Time", "Actor", "Action", "Target", "IP", "Entity"];
  const lines = rows.map((row) =>
    [
      row.timestamp,
      row.actor,
      row.action,
      row.target,
      row.ip ?? "—",
      row.entityType ?? "unknown",
    ]
      .map((value) => escapeCsv(String(value)))
      .join(","),
  );

  return [header.map(escapeCsv).join(","), ...lines].join("\r\n");
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-6 text-center text-sm text-neutral-500">
      Loading audit logs...
    </div>
  );
}

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
        <RefreshCw className="size-3.5" />
        Retry
      </Button>
    </div>
  );
}

export default function AuditLogsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, meta, loading, error, refetch } = useAuditLogs({
    page,
    limit,
    search,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleExportCsv = () => {
    if (data.length === 0) return;

    const blob = new Blob([buildCsv(data)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-page-${page}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Time",
        cell: ({ row }) => {
          const timestamp = row.original.timestamp;
          const [datePart, timePart] = timestamp.split(", ");
          return (
            <div className="min-w-37.5">
              <div className="font-medium text-neutral-900">{datePart}</div>
              <div className="mt-0.5 text-xs text-neutral-500">{timePart}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "actor",
        header: "Actor",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium text-neutral-900">
              {row.original.actor}
            </div>
            <div className="mt-0.5 text-xs text-neutral-500">
              {row.original.entityType
                ? row.original.entityType.toUpperCase()
                : "UNKNOWN"}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-neutral-700">
            {row.original.action.replace(/_/g, " ").toLowerCase()}
          </span>
        ),
      },
      {
        accessorKey: "target",
        header: "Target",
        cell: ({ row }) => (
          <div
            className="max-w-70 truncate font-mono text-sm text-neutral-900"
            title={row.original.target}
          >
            {row.original.target}
          </div>
        ),
      },
      {
        accessorKey: "ip",
        header: "IP",
        cell: ({ row }) => {
          const ip = row.original.ip ?? "—";
          const isLocal = ip === "::1" || ip === "127.0.0.1";
          return (
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 font-mono text-xs",
                isLocal
                  ? "border border-amber-200 bg-amber-50 text-amber-700"
                  : "border border-neutral-200 bg-neutral-50 text-neutral-700",
              )}
              title={ip}
            >
              {ip}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h3 className="text-sm font-semibold text-neutral-900">
          Audit activity
        </h3>
        <p className="text-xs text-neutral-500">
          Review who did what, when, and from where.
        </p>
      </div>
      <SearchToolbar
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by actor..."
        className="lg:items-center"
      >
        <Button
          variant="outline"
          className="h-10 rounded-lg shrink-0 gap-2"
          onClick={handleExportCsv}
          disabled={data.length === 0}
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </SearchToolbar>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <DataTable columns={columns} data={data} className="shadow-none" />
      )}

      <div className="flex items-center justify-between px-2 pt-2">
        <p className="text-sm text-muted-foreground">
          Page {meta.page} of {meta.totalPages} ({meta.total} total logs)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || loading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= meta.totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
