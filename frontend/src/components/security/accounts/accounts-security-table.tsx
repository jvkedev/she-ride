"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { toast } from "sonner";

import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/shared/dashboard/loading-skeleton";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import {
  useSuspiciousAccounts,
  useBlockUser,
  useUnblockUser,
  useResolveAccountFlag,
} from "@/hooks/security/use-accounts";
import type { SuspiciousAccount } from "@/lib/security/types";
import type { DashboardStatus } from "@/components/shared/dashboard/status-badge";
import { AlertCircle, ShieldCheck, ShieldX } from "lucide-react";

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default function AccountsSecurityTable() {
  const {
    data: accounts = [],
    isLoading,
    error,
  } = useSuspiciousAccounts({ isResolved: false });
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const resolveFlag = useResolveAccountFlag();

  const { search, setSearch, filtered } = useAdminFilters<SuspiciousAccount>(
    accounts,
    {
      searchKeys: ["userId", "reasons"],
    },
  );

  const handleBlock = async (userId: string) => {
    try {
      await blockUser.mutateAsync(userId);
      toast.success("User blocked");
    } catch {
      toast.error("Failed to block user");
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await unblockUser.mutateAsync(userId);
      toast.success("User unblocked");
    } catch {
      toast.error("Failed to unblock user");
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveFlag.mutateAsync({ id });
      toast.success("Flag resolved");
    } catch {
      toast.error("Failed to resolve flag");
    }
  };

  const columns = useMemo<ColumnDef<SuspiciousAccount>[]>(
    () => [
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-neutral-900">
              {row.original.user?.fullName ?? "—"}
            </p>
            <p className="text-xs text-neutral-500">
              {row.original.user?.email ?? "—"}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "user.phoneNumber",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-sm text-neutral-700">
            {row.original.user?.phoneNumber ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "reasons",
        header: "Reasons",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.reasons.map((r) => (
              <span
                key={r}
                className="rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-700 border border-amber-200"
              >
                {r}
              </span>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "riskScore",
        header: "Risk Score",
        cell: ({ row }) => {
          const score = row.original.riskScore;
          const color =
            score >= 80
              ? "text-red-600"
              : score >= 50
                ? "text-amber-600"
                : "text-emerald-600";
          return (
            <span className={`font-semibold text-sm ${color}`}>
              {score.toFixed(0)} / 100
            </span>
          );
        },
      },
      {
        accessorKey: "user.accountStatus",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            status={
              (row.original.user?.accountStatus?.toLowerCase() ??
                "active") as DashboardStatus
            }
          />
        ),
      },
      {
        accessorKey: "flaggedAt",
        header: "Flagged",
        cell: ({ row }) => (
          <span className="text-xs text-neutral-500">
            {new Date(row.original.flaggedAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isBlocked = row.original.user?.accountStatus === "BLOCKED";
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg text-xs"
                onClick={() => handleResolve(row.original.id)}
                disabled={resolveFlag.isPending}
              >
                <ShieldCheck className="mr-1 h-3 w-3" />
                Resolve
              </Button>
              <Button
                size="sm"
                variant={isBlocked ? "outline" : "destructive"}
                className="h-8 rounded-lg text-xs"
                onClick={() =>
                  isBlocked
                    ? handleUnblock(row.original.userId)
                    : handleBlock(row.original.userId)
                }
                disabled={blockUser.isPending || unblockUser.isPending}
              >
                {isBlocked ? (
                  <>
                    <ShieldCheck className="mr-1 h-3 w-3" /> Unblock
                  </>
                ) : (
                  <>
                    <ShieldX className="mr-1 h-3 w-3" /> Block
                  </>
                )}
              </Button>
            </div>
          );
        },
      },
    ],
    [blockUser.isPending, unblockUser.isPending, resolveFlag.isPending],
  );

  return (
    <div className="space-y-4">
      <SearchToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search suspicious accounts..."
      />

      {isLoading && <TableSkeleton />}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Failed to load accounts: {(error as Error).message}</span>
        </div>
      )}

      {!isLoading && !error && (
        <DataTable<SuspiciousAccount>
          columns={columns}
          data={filtered}
          pageSize={8}
        />
      )}
    </div>
  );
}
