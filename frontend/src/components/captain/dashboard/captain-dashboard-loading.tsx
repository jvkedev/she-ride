import { CaptainMapSkeleton, CaptainStatsSkeleton } from "@/components/captain/shared/captain-loading-skeleton";
import { CaptainSkeleton } from "@/components/captain/shared/captain-loading-skeleton";

export default function CaptainDashboardLoading() {
  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:p-6">
      <div className="space-y-4">
        <CaptainStatsSkeleton />
        <CaptainSkeleton className="h-36" />
        <CaptainSkeleton className="h-48" />
      </div>
      <CaptainMapSkeleton />
    </div>
  );
}
