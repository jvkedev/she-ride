"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import PendingRoleGuard from "@/components/auth/pending-role-guard";
import CaptainHeader from "@/components/captain/layout/captain-header";
import CaptainMobileNav from "@/components/captain/layout/captain-mobile-nav";
import CaptainRoutePrefetch from "@/components/captain/layout/captain-route-prefetch";
import CaptainSidebar from "@/components/captain/layout/captain-sidebar";
import { cn } from "@/lib/utils";

const MAP_LAYOUT_ROUTES = ["/captain", "/captain/active-ride"];

type CaptainLayoutShellProps = {
  children: React.ReactNode;
};

export default function CaptainLayoutShell({
  children,
}: CaptainLayoutShellProps) {
  const [isOnline, setIsOnline] = useState(true);
  const pathname = usePathname();
  const isMapLayout = MAP_LAYOUT_ROUTES.includes(pathname);

  return (
    <PendingRoleGuard>
      <div className="dashboard-viewport-lock flex h-dvh max-h-dvh min-h-0 overflow-hidden bg-[#f6f6f6]">
        <CaptainRoutePrefetch />
        <CaptainSidebar isOnline={isOnline} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <CaptainHeader isOnline={isOnline} onOnlineChange={setIsOnline} />
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
        <CaptainMobileNav />
      </div>
    </PendingRoleGuard>
  );
}
