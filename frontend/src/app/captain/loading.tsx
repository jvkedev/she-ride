import { CaptainSkeleton, CaptainStatsSkeleton } from "@/components/captain/shared/captain-loading-skeleton";

export default function CaptainLoading() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <CaptainSkeleton className="h-8 w-48" />
      <CaptainStatsSkeleton />
      <CaptainSkeleton className="h-40" />
    </div>
  );
}
