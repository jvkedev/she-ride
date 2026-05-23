"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavGroups } from "@/lib/admin/nav-links";
import { cn } from "@/lib/utils";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex">
      <div className="shrink-0 border-b border-neutral-100 px-4 py-5">
        <Link href="/admin" className="text-lg font-bold tracking-tight text-neutral-900">
          She Ride
        </Link>
        <p className="mt-0.5 text-xs font-medium text-neutral-500">Admin Console</p>
      </div>

      <nav className="dashboard-panel-scroll min-h-0 flex-1 px-2 py-4">
        {adminNavGroups.map((group) => (
          <div key={group.title} className="mb-5 last:mb-0">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.links.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/admin" && pathname.startsWith(link.href));

                return (
                  <li key={link.href}>
                    <Link
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
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-neutral-100 p-4">
        <p className="text-xs text-neutral-500">Signed in as</p>
        <p className="text-sm font-medium text-neutral-900">Admin User</p>
      </div>
    </aside>
  );
}
