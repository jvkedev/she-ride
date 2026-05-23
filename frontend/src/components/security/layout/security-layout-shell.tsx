"use client";

import { usePathname } from "next/navigation";

import SecurityHeader from "@/components/security/layout/security-header";
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
    <div className="flex h-dvh overflow-hidden bg-[#f6f6f6]">
      <SecurityRoutePrefetch />
      <SecuritySidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <SecurityHeader />
        <main
          className={cn(
            "min-h-0 flex-1",
            isMapLayout ? "overflow-hidden" : "overflow-y-auto",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
