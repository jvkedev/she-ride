"use client";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { dashboardHeading } from "@/lib/dashboard/styles";
import { useAdminActivityFeed } from "@/hooks/admin/use-admin-dashboard";
import { cn } from "@/lib/utils";

const typeColors = {
  ride: "bg-blue-100 text-blue-700",
  driver: "bg-purple-100 text-purple-700",
  payment: "bg-emerald-100 text-emerald-700",
  safety: "bg-red-100 text-red-700",
};

export default function RecentActivityFeed() {
  const { data, isLoading, isError } = useAdminActivityFeed();

  return (
    <SurfaceCard>
      <h2 className={dashboardHeading}>Recent activity</h2>
      {isLoading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      ) : isError ? (
        <p className="mt-4 text-sm text-red-600">Failed to load activity feed.</p>
      ) : !data?.length ? (
        <p className="mt-4 text-sm text-neutral-500">No recent activity.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {data.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-neutral-100 px-3 py-3"
            >
              <span
                className={cn(
                  "mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                  typeColors[item.type],
                )}
              >
                {item.type}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-neutral-800">{item.message}</p>
                <p className="mt-0.5 text-xs text-neutral-400">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  );
}
