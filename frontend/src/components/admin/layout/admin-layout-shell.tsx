"use client";

import { usePathname } from "next/navigation";

import AdminHeader from "@/components/admin/layout/admin-header";
import AdminMobileNav from "@/components/admin/layout/admin-mobile-nav";
import AdminRoutePrefetch from "@/components/admin/layout/admin-route-prefetch";
import AdminSidebar from "@/components/admin/layout/admin-sidebar";
import { cn } from "@/lib/utils";

const MAP_LAYOUT_ROUTES = ["/admin/tracking"];

type AdminLayoutShellProps = {
  children: React.ReactNode;
};

export default function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const pathname = usePathname();
  const isMapLayout = MAP_LAYOUT_ROUTES.includes(pathname);

  return (
    <div className="dashboard-viewport-lock flex h-dvh max-h-dvh min-h-0 overflow-hidden bg-[#f6f6f6]">
      <AdminRoutePrefetch />
      <AdminSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminHeader />
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
      <AdminMobileNav />
    </div>
  );
}
