"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import DashboardLogoutButton from "@/components/shared/dashboard/logout-button";
import { adminNavLinks } from "@/lib/admin/nav-links";
import { useAdminProfile } from "@/hooks/admin/use-admin-profile";
import { cn } from "@/lib/utils";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: profile } = useAdminProfile();
  const displayName = profile?.name ?? "Admin";

  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex">
      <div className="shrink-0 border-b border-neutral-100 px-4 py-5">
        <Link
          href="/admin"
          className="text-lg font-bold tracking-tight text-neutral-900"
        >
          She Ride
        </Link>
        <p className="mt-0.5 text-xs font-medium text-neutral-500">Admin</p>
      </div>

      <nav className="dashboard-panel-scroll min-h-0 flex-1 space-y-0.5 px-2 py-4">
        {adminNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));

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
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700">
            {profile?.profileImage ? (
              <img src={profile.profileImage} alt="" className="size-full object-cover" />
            ) : (
              displayName.charAt(0)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">
              {displayName}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {profile?.jobTitleLabel ?? "Admin"}
            </p>
            {profile?.departmentLabel ? (
              <p className="truncate text-[10px] text-neutral-400">
                {profile.departmentLabel}
              </p>
            ) : null}
          </div>
        </div>
        <DashboardLogoutButton className="mt-3" />
      </div>
    </aside>
  );
}
