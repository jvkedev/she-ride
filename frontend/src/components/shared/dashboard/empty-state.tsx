import type { LucideIcon } from "lucide-react";

import SurfaceCard from "@/components/shared/dashboard/surface-card";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <SurfaceCard className="flex flex-col items-center py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-neutral-100">
        <Icon className="size-6 text-neutral-500" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </SurfaceCard>
  );
}
