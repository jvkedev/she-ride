"use client";

import { usePathname } from "next/navigation";

import SecurityHeader from "@/components/security/layout/security-header";
import SecurityMobileNav from "@/components/security/layout/security-mobile-nav";
import SecurityRoutePrefetch from "@/components/security/layout/security-route-prefetch";
import SecuritySidebar from "@/components/security/layout/security-sidebar";
import { MAP_LAYOUT_ROUTES } from "@/lib/security/nav-links";
import { cn } from "@/lib/utils";

type SecurityLayoutShellProps = {
  children: React.ReactNode;
};

export default function SecurityLayoutShell({
  children,
}: SecurityLayoutShellProps) {
  const pathname = usePathname();
  const isMapLayout = MAP_LAYOUT_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );

  return (
    <div className="dashboard-viewport-lock flex h-dvh max-h-dvh min-h-0 overflow-hidden bg-[#f6f6f6]">
      <SecurityRoutePrefetch />
      <SecuritySidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <SecurityHeader />
        <main
          className={cn(
            "min-h-0 flex-1 pb-16 lg:pb-0",
            isMapLayout
              ? "flex flex-col overflow-hidden"
              : "overflow-y-auto",
          )}
        >
          {children}
        </main>
      </div>
      <SecurityMobileNav />
    </div>
  );
}
