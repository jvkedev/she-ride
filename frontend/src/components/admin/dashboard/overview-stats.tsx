"use client";

import {
  AlertTriangle,
  Car,
  CircleDollarSign,
  FileWarning,
  Headphones,
  MapPin,
  UserCheck,
  Users,
} from "lucide-react";

import StatWidget from "@/components/shared/dashboard/stat-widget";
import { useAdminDashboardStats } from "@/hooks/admin/use-admin-dashboard";

function formatCurrency(value: number) {
  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(1)}L`;
  }
  if (value >= 1_000) {
    return `₹${(value / 1_000).toFixed(1)}k`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function OverviewStats() {
  const { data, isLoading, isError } = useAdminDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-100" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
        Failed to load dashboard metrics.
      </div>
    );
  }

  const { overview, thisMonth, rates } = data;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
      <StatWidget
        label="Revenue (today)"
        value={formatCurrency(overview.revenueToday)}
        hint="Completed rides"
        icon={CircleDollarSign}
        accent="primary"
      />
      <StatWidget
        label="Revenue (week)"
        value={formatCurrency(overview.revenueThisWeek)}
        icon={CircleDollarSign}
      />
      <StatWidget
        label="Revenue (month)"
        value={formatCurrency(overview.revenueThisMonth)}
        hint={
          thisMonth.revenueGrowthPercent != null
            ? `${thisMonth.revenueGrowthPercent > 0 ? "+" : ""}${thisMonth.revenueGrowthPercent}% vs last month`
            : undefined
        }
        icon={CircleDollarSign}
        accent="primary"
      />
      <StatWidget
        label="Active rides"
        value={String(overview.activeRides)}
        hint="Live on road"
        icon={MapPin}
        accent="primary"
      />
      <StatWidget
        label="Completed rides"
        value={String(overview.completedRides)}
        icon={MapPin}
      />
      <StatWidget
        label="Cancelled rides"
        value={String(overview.cancelledRides)}
        icon={AlertTriangle}
      />
      <StatWidget
        label="Online captains"
        value={String(overview.onlineCaptains)}
        icon={Car}
      />
      <StatWidget
        label="Total captains"
        value={String(overview.totalCaptains)}
        hint={`+${thisMonth.newCaptains} this month`}
        icon={Car}
      />
      <StatWidget
        label="Total riders"
        value={overview.totalRiders.toLocaleString("en-IN")}
        hint={`+${thisMonth.newRiders} this month`}
        icon={Users}
      />
      <StatWidget
        label="Pending KYC"
        value={String(overview.pendingKyc)}
        hint="Awaiting security review"
        icon={UserCheck}
        accent="primary"
      />
      {overview.approvedKyc !== undefined ? (
        <StatWidget
          label="Verified captains"
          value={String(overview.approvedKyc)}
          hint="Documents approved"
          icon={UserCheck}
        />
      ) : null}
      {overview.rejectedKyc !== undefined ? (
        <StatWidget
          label="Rejected KYC"
          value={String(overview.rejectedKyc)}
          hint="Needs re-upload"
          icon={AlertTriangle}
        />
      ) : null}
      <StatWidget
        label="Pending reports"
        value={String(overview.pendingReports)}
        icon={FileWarning}
      />
      <StatWidget
        label="Open tickets"
        value={String(overview.openSupportTickets)}
        icon={Headphones}
      />
      <StatWidget
        label="Completion rate"
        value={`${rates.completionRate}%`}
        hint={`Cancel rate ${rates.cancellationRate}%`}
        icon={MapPin}
      />
    </div>
  );
}
