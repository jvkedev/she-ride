"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { captainNavLinks } from "@/components/captain/layout/captain-nav-links";
import CaptainStatusBadge from "@/components/captain/shared/captain-status-badge";
import DashboardLogoutButton from "@/components/shared/dashboard/logout-button";
import { captainProfile } from "@/lib/captain/captain-mock-data";
import { cn } from "@/lib/utils";

type CaptainSidebarProps = {
  isOnline?: boolean;
};

export default function CaptainSidebar({
  isOnline = true,
}: CaptainSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex lg:h-full lg:min-h-0">
      <div className="shrink-0 border-b border-neutral-100 px-4 py-5">
        <Link
          href="/captain"
          className="text-lg font-bold tracking-tight text-neutral-900"
        >
          She Ride
        </Link>
        <p className="mt-0.5 text-xs font-medium text-neutral-500">Captain</p>
      </div>

      <nav className="captain-panel-scroll min-h-0 flex-1 space-y-0.5 px-2 py-4">
        {captainNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/captain" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-neutral-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700">
            {captainProfile.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">
              {captainProfile.name}
            </p>
            <p className="text-xs text-neutral-500">
              ★ {captainProfile.rating} · {captainProfile.totalTrips} trips
            </p>
          </div>
        </div>
        <div className="mt-3"></div>
        <DashboardLogoutButton className="mt-3" />
      </div>
    </aside>
  );
}
