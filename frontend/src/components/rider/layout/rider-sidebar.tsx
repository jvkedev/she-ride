"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { riderSidebarLinks } from "@/components/rider/layout/rider-nav-links";
import DashboardLogoutButton from "@/components/shared/dashboard/logout-button";
import {
  getRiderProfile,
  RiderProfile,
} from "@/services/profile/profile.service";
import { cn } from "@/lib/utils";

export default function RiderSidebar() {
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    getRiderProfile()
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
  }, []);

  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex">
      <div className="shrink-0 border-b border-neutral-100 px-4 py-5">
        <Link
          href="/rider"
          className="text-lg font-bold tracking-tight text-neutral-900"
        >
          She Ride
        </Link>
        <p className="mt-0.5 text-xs font-medium text-neutral-500">Rider</p>
      </div>

      <nav className="rider-panel-scroll min-h-0 flex-1 space-y-0.5 px-2 py-4">
        {riderSidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/rider" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch
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
        <Link
          href="/rider/profile"
          className="flex items-center gap-3 rounded-lg transition hover:bg-neutral-50"
        >
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700">
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{profile?.fullName?.charAt(0) ?? "R"}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">
              {profile?.fullName ?? "Rider"}
            </p>
            <p className="text-xs text-neutral-500">
              {profile
                ? `★ ${profile.rating.toFixed(1)} · ${profile.totalRides} rides`
                : "Loading profile..."}
            </p>
          </div>
        </Link>
        <DashboardLogoutButton className="mt-3" />
      </div>
    </aside>
  );
}
