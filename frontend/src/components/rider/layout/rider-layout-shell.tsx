"use client";

import { usePathname } from "next/navigation";

import RiderHeader from "@/components/rider/layout/rider-header";
import RiderMobileNav from "@/components/rider/layout/rider-mobile-nav";
import RiderRoutePrefetch from "@/components/rider/layout/rider-route-prefetch";
import RiderSidebar from "@/components/rider/layout/rider-sidebar";
import { cn } from "@/lib/utils";

const MAP_LAYOUT_ROUTES = ["/rider", "/rider/rentals", "/rider/parcel"];

type RiderLayoutShellProps = {
  children: React.ReactNode;
};

export default function RiderLayoutShell({ children }: RiderLayoutShellProps) {
  const pathname = usePathname();
  const isMapLayout = MAP_LAYOUT_ROUTES.includes(pathname);

  return (
    <div className="flex h-dvh overflow-hidden bg-[#f6f6f6]">
      <RiderRoutePrefetch />
      <RiderSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <RiderHeader />
        <main
          className={cn(
            "min-h-0 flex-1 pb-16 lg:pb-0",
            isMapLayout ? "overflow-hidden" : "overflow-y-auto",
          )}
        >
          {children}
        </main>
      </div>
      <RiderMobileNav />
    </div>
  );
}
