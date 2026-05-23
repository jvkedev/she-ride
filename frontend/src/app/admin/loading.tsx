import { StatsRowSkeleton, TableSkeleton } from "@/components/shared/dashboard/loading-skeleton";

export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-neutral-200" />
      <StatsRowSkeleton />
      <TableSkeleton />
    </div>
  );
}
