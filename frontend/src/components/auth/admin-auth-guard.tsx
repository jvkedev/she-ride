"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { apiGet } from "@/lib/api";
import {
  getAccessToken,
  getDashboardPathForRole,
  getStoredUser,
} from "@/lib/auth/session";

type AdminAuthGuardProps = {
  children: React.ReactNode;
};

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const token = getAccessToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      const stored = getStoredUser();
      if (stored && stored.role !== "ADMIN") {
        router.replace(getDashboardPathForRole(stored.role));
        return;
      }

      try {
        const me = await apiGet("/auth/me", token);
        if (cancelled) return;

        const role = me.user?.role ?? stored?.role;

        if (me.requiresRoleSelection) {
          router.replace("/select-role");
          return;
        }

        if (role !== "ADMIN") {
          router.replace(getDashboardPathForRole(role ?? "PENDING"));
          return;
        }

        setReady(true);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    }

    setReady(false);
    verify();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[#f6f6f6] text-sm text-neutral-500">
        Verifying admin access…
      </div>
    );
  }

  return <>{children}</>;
}
