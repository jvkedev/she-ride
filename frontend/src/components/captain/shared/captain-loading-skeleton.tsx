import { cn } from "@/lib/utils";

type CaptainLoadingSkeletonProps = {
  className?: string;
};

export function CaptainSkeleton({
  className,
}: CaptainLoadingSkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-neutral-200", className)}
      aria-hidden
    />
  );
}

export function CaptainStatsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CaptainSkeleton key={i} className="h-24" />
      ))}
    </div>
  );
}

export function CaptainMapSkeleton() {
  return (
    <CaptainSkeleton className="h-full min-h-[320px] w-full rounded-2xl" />
  );
}
