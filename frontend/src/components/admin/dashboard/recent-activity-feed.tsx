import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { dashboardHeading } from "@/lib/dashboard/styles";
import { recentActivity } from "@/lib/admin/mock-data";
import { cn } from "@/lib/utils";

const typeColors = {
  ride: "bg-blue-100 text-blue-700",
  driver: "bg-purple-100 text-purple-700",
  payment: "bg-emerald-100 text-emerald-700",
  safety: "bg-red-100 text-red-700",
};

export default function RecentActivityFeed() {
  return (
    <SurfaceCard>
      <h2 className={dashboardHeading}>Recent activity</h2>
      <ul className="mt-4 space-y-3">
        {recentActivity.map((item) => (
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
    </SurfaceCard>
  );
}
