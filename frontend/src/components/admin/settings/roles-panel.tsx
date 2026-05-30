"use client";

import { useEffect, useState } from "react";
import { Loader2, Shield, UserCog, Users, Car, Clock } from "lucide-react";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { dashboardHeading } from "@/lib/dashboard/styles";
import {
  fetchRoleStats,
  type AdminRoleStat,
} from "@/services/admin/admin.service";
import { cn } from "@/lib/utils";

const roleIcons: Record<string, typeof Users> = {
  ADMIN: UserCog,
  RIDER: Users,
  CAPTAIN: Car,
  SECURITY: Shield,
  PENDING: Clock,
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
  RIDER: "bg-blue-50 text-blue-700 border-blue-200",
  CAPTAIN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SECURITY: "bg-amber-50 text-amber-700 border-amber-200",
  PENDING: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

export default function RolesPanel() {
  const [roles, setRoles] = useState<AdminRoleStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoleStats()
      .then(setRoles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <SurfaceCard>
      <h2 className={dashboardHeading}>Platform user roles</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Authorization roles (Rider, Captain, Admin, etc.) — distinct from admin
        department and job title.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="size-4 animate-spin" />
          Loading roles…
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {roles.map((role) => {
            const Icon = roleIcons[role.role] ?? Users;
            return (
              <li
                key={role.role}
                className="flex items-start gap-3 rounded-lg border border-neutral-100 px-3 py-3"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border",
                    roleColors[role.role],
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-neutral-900">
                      {role.name}
                    </p>
                    <span className="shrink-0 text-xs font-semibold text-neutral-700">
                      {role.users} users
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {role.permissions}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SurfaceCard>
  );
}
