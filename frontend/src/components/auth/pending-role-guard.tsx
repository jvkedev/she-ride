"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { apiGet } from "@/lib/api";
import { getAccessToken } from "@/lib/auth/session";

type PendingRoleGuardProps = {
  children: React.ReactNode;
};

/** Redirects users who have not selected a role away from dashboards. */
export default function PendingRoleGuard({ children }: PendingRoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function checkRole() {
      const token = getAccessToken();
      if (!token) return;

      try {
        const status = await apiGet("/auth/me", token);
        if (cancelled) return;

        if (status.requiresRoleSelection) {
          router.replace("/select-role");
        }
      } catch {
        // Ignore — user may be on mock-only UI without API
      }
    }

    checkRole();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return <>{children}</>;
}
