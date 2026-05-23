"use client";

import { usePathname } from "next/navigation";

import Footer from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { isAuthOnlyRoute, isDashboardRoute } from "@/lib/layout/dashboard-routes";

type PublicShellProps = {
  children: React.ReactNode;
};

export default function PublicShell({ children }: PublicShellProps) {
  const pathname = usePathname();

  if (isDashboardRoute(pathname) || isAuthOnlyRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
