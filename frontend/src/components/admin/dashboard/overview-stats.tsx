import {
  Car,
  CircleDollarSign,
  MapPin,
  UserCheck,
  Users,
} from "lucide-react";

import StatWidget from "@/components/shared/dashboard/stat-widget";
import { adminOverviewStats } from "@/lib/admin/mock-data";

export default function OverviewStats() {
  const stats = adminOverviewStats;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <StatWidget
        label="Revenue (today)"
        value={`₹${(stats.revenue / 100000).toFixed(1)}L`}
        hint="Platform gross"
        icon={CircleDollarSign}
        accent="primary"
        trend={{ value: stats.revenueChange, positive: true }}
      />
      <StatWidget
        label="Active rides"
        value={String(stats.activeRides)}
        hint="Live on road"
        icon={MapPin}
        accent="primary"
      />
      <StatWidget
        label="Online drivers"
        value={String(stats.onlineDrivers)}
        icon={Car}
      />
      <StatWidget
        label="Pending approvals"
        value={String(stats.pendingApprovals)}
        hint="KYC review needed"
        icon={UserCheck}
        accent="primary"
      />
      <StatWidget
        label="Total riders"
        value={stats.totalRiders.toLocaleString("en-IN")}
        icon={Users}
      />
    </div>
  );
}
