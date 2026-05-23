"use client";

import PriorityBadge from "@/components/shared/security/priority-badge";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { dashboardHeading } from "@/lib/dashboard/styles";
import { useSecurityWebSocket } from "@/hooks/security/use-security-websocket";
import { cn } from "@/lib/utils";

const typeColors = {
  sos: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  fraud: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400",
  incident: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400",
  audit: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  ride: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400",
};

export default function SecurityActivityFeed() {
  const { events } = useSecurityWebSocket();

  return (
    <SurfaceCard>
      <h2 className={dashboardHeading}>Real-time activity</h2>
      <ul className="mt-4 max-h-[400px] space-y-2 overflow-y-auto">
        {events.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-lg border border-neutral-100 px-3 py-3 dark:border-neutral-800"
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
              <p className="text-sm text-neutral-800 dark:text-neutral-200">
                {item.message}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs text-neutral-400">{item.time}</p>
                {item.priority ? <PriorityBadge priority={item.priority} /> : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}
