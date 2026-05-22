import type { LucideIcon } from "lucide-react";

import CaptainCard from "@/components/captain/shared/captain-card";

type CaptainEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export default function CaptainEmptyState({
  icon: Icon,
  title,
  description,
}: CaptainEmptyStateProps) {
  return (
    <CaptainCard className="flex flex-col items-center py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-neutral-100">
        <Icon className="size-6 text-neutral-500" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-neutral-500">{description}</p>
    </CaptainCard>
  );
}
