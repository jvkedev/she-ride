"use client";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { dashboardHeading } from "@/lib/dashboard/styles";
import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export default function ChartCard({
  title,
  description,
  children,
  className,
}: ChartCardProps) {
  return (
    <SurfaceCard className={cn("flex flex-col", className)}>
      <div className="mb-4">
        <h2 className={dashboardHeading}>{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
        ) : null}
      </div>
      <div className="min-h-[240px] w-full">{children}</div>
    </SurfaceCard>
  );
}
