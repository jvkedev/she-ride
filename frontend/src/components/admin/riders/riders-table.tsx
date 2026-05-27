"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import DataTable from "@/components/shared/dashboard/data-table";
import SearchToolbar from "@/components/shared/dashboard/search-toolbar";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminFilters } from "@/hooks/admin/use-admin-filters";
import { useAdminRiders } from "@/hooks/admin/use-admin-riders";
import type { AdminRider } from "@/lib/admin/types";

// ── Skeleton ──────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-100">
      <div className="bg-neutral-50 px-4 py-3">
        <div className="h-4 w-40 animate-pulse rounded bg-neutral-200" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-6 border-t border-neutral-100 px-4 py-3"
        >
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 animate-pulse rounded bg-neutral-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="h-3.5 w-28 animate-pulse rounded bg-neutral-200" />
          <div className="h-3.5 w-8 animate-pulse rounded bg-neutral-200" />
          <div className="h-3.5 w-8 animate-pulse rounded bg-neutral-200" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-200" />
          <div className="flex gap-1.5">
            <div className="h-8 w-14 animate-pulse rounded-lg bg-neutral-200" />
            <div className="h-8 w-16 animate-pulse rounded-lg bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-100 bg-red-50 py-12">
      <AlertTriangle className="size-5 text-red-400" />
      <p className="text-sm text-red-600">{message}</p>
      <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5 text-xs">
        <RefreshCw className="size-3.5" /> Retry
      </Button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function RidersTable() {
  const { riders, loading, error, actionState, toggleBlock, refetch } = useAdminRiders();
  const { search, setSearch, filtered } = useAdminFilters(riders, {
    searchKeys: ["name", "phone", "email"],
    statusKey: "status",
  });

  const [confirmRider, setConfirmRider] = useState<AdminRider | null>(null);

  async function handleConfirm() {
    if (!confirmRider) return;
    setConfirmRider(null);
    await toggleBlock(confirmRider);
  }

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
        cell: ({ row }) => {
          const rider = row.original;
          const isThisLoading = actionState.loading && actionState.riderId === rider.id;
          const isActive = rider.status === "active";

          return (
            <div className="flex gap-1.5">
              <Link href={`/admin/riders/${rider.id}`}>
                <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">
                  View
                </Button>
              </Link>
              <Button
                size="sm"
                variant={isActive ? "destructive" : "outline"}
                className="h-8 min-w-[68px] rounded-lg text-xs"
                disabled={isThisLoading}
                onClick={() => setConfirmRider(rider)}
              >
                {isThisLoading ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : isActive ? (
                  "Block"
                ) : (
                  "Unblock"
                )}
              </Button>
            </div>
          );
        },
      },
    ],
    [actionState],
  );

  return (
    <>
      <div className="space-y-4">
        <SearchToolbar
          searchPlaceholder="Search riders..."
          searchValue={search}
          onSearchChange={setSearch}
        />

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <DataTable<AdminRider> columns={columns} data={filtered} pageSize={8} emptyMessage="No riders found." />

        )}
      </div>

      {/* Confirmation dialog */}
      <AlertDialog
        open={!!confirmRider}
        onOpenChange={(open: boolean) => !open && setConfirmRider(null)}

      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmRider?.status === "active"
                ? "Block this rider?"
                : "Unblock this rider?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRider?.status === "active" ? (
                <>
                  <span className="font-medium text-neutral-900">
                    {confirmRider?.name}
                  </span>{" "}
                  will be blocked and won&apos;t be able to book rides until unblocked.
                </>
              ) : (
                <>
                  <span className="font-medium text-neutral-900">
                    {confirmRider?.name}
                  </span>{" "}
                  will be restored and can book rides again.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                confirmRider?.status === "active"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {confirmRider?.status === "active" ? "Yes, Block" : "Yes, Unblock"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}