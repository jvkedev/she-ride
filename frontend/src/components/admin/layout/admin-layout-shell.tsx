"use client";

import { usePathname } from "next/navigation";

import AdminHeader from "@/components/admin/layout/admin-header";
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
    <div className="flex h-dvh overflow-hidden bg-[#f6f6f6]">
      <AdminRoutePrefetch />
      <AdminSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminHeader />
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
