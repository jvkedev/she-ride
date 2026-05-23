"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiGet } from "@/lib/api";
import {
  getAccessToken,
  getDashboardPathForRole,
  getStoredUser,
  hasRoleSelectionGrant,
} from "@/lib/auth/session";

type RoleSelectionGuardProps = {
  children: React.ReactNode;
};

export default function RoleSelectionGuard({ children }: RoleSelectionGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyAccess() {
      const token = getAccessToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const status = await apiGet("/auth/me", token);

        if (cancelled) return;

        if (!status.requiresRoleSelection) {
          const user = status.user ?? getStoredUser();
          router.replace(getDashboardPathForRole(user?.role ?? "RIDER"));
          return;
        }

        if (!status.canAccessRoleSelection && !hasRoleSelectionGrant()) {
          router.replace("/login");
          return;
        }

        setAllowed(true);
      } catch {
        if (!cancelled) {
          router.replace("/login");
        }
      }
    }

    verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
