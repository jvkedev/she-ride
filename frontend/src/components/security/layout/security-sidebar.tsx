"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import DashboardLogoutButton from "@/components/shared/dashboard/logout-button";
import { securityNavLinks } from "@/lib/security/nav-links";
import { useSecurityProfile } from "@/hooks/security/use-security-profile";
import { cn } from "@/lib/utils";

export default function SecuritySidebar() {
  const pathname = usePathname();
  const { data: profile } = useSecurityProfile();
  const displayName = profile?.name ?? "Security";

  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex">
      <div className="shrink-0 border-b border-neutral-100 px-4 py-5">
        <Link
          href="/security"
          className="text-lg font-bold tracking-tight text-neutral-900"
        >
          She Ride
        </Link>
        <p className="mt-0.5 text-xs font-medium text-neutral-500">Security</p>
      </div>

      <nav className="dashboard-panel-scroll min-h-0 flex-1 space-y-0.5 px-2 py-4">
        {securityNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/security" && pathname.startsWith(link.href));

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
          href="/security/profile"
          prefetch
          className="group block rounded-2xl bg-neutral-50 p-3 transition hover:bg-neutral-100"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700">
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{displayName.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">
                {displayName}
              </p>
              <p className="text-xs text-neutral-500">
                {profile?.memberSince
                  ? `Security · since ${new Date(profile.memberSince).getFullYear()}`
                  : "Security staff"}
              </p>
            </div>
          </div>
        </Link>
        <DashboardLogoutButton className="mt-3" />
      </div>
    </aside>
  );
}
