"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { dashboardHeading } from "@/lib/dashboard/styles";
import {
  fetchAdminTeam,
  type AdminTeamMember,
} from "@/services/admin/admin-profile.service";

export default function AdminTeamPanel() {
  const [team, setTeam] = useState<AdminTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminTeam()
      .then(setTeam)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <SurfaceCard className="lg:col-span-2">
      <h2 className={dashboardHeading}>Admin team</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Platform administrators with organizational metadata. Authorization uses
        permission roles; department and job title are organizational only.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="size-4 animate-spin" />
          Loading team…
        </div>
      ) : team.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No admin accounts found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-100">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-neutral-50 text-xs text-neutral-500">
              <tr>
                <th className="px-3 py-2.5 font-medium">Name</th>
                <th className="px-3 py-2.5 font-medium">Email</th>
                <th className="px-3 py-2.5 font-medium">Permission role</th>
                <th className="px-3 py-2.5 font-medium">Department</th>
                <th className="px-3 py-2.5 font-medium">Job title</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr key={member.id} className="border-t border-neutral-100">
                  <td className="px-3 py-3 font-medium text-neutral-900">
                    {member.name}
                  </td>
                  <td className="px-3 py-3 text-neutral-600">{member.email}</td>
                  <td className="px-3 py-3 text-neutral-700">
                    {member.permissionRoleLabel ?? member.permissionRole}
                  </td>
                  <td className="px-3 py-3 text-neutral-600">
                    {member.departmentLabel ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-neutral-600">
                    {member.jobTitleLabel ?? "—"}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge
                      status={
                        member.status === "active" ? "active" : "inactive"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SurfaceCard>
  );
}
