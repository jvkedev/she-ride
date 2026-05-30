"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Fingerprint,
  Loader2,
  MapPin,
  ShieldAlert,
  UserX,
} from "lucide-react";

import StatWidget from "@/components/shared/dashboard/stat-widget";
import { fetchSecurityOverviewStats } from "@/services/security/security-profile.service";

export default function SecurityOverviewStats() {
  const [stats, setStats] = useState({
    activeSos: 0,
    fraudAttempts: 0,
    suspiciousAccounts: 0,
    highRiskRides: 0,
    blockedUsers: 0,
    openIncidents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchSecurityOverviewStats()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-neutral-500">
        <Loader2 className="size-4 animate-spin" />
        Loading overview…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
        <AlertTriangle className="size-4 shrink-0" />
        Failed to load security overview stats.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatWidget
        label="Active SOS"
        value={String(stats.activeSos)}
        icon={ShieldAlert}
        accent="primary"
      />
      <StatWidget
        label="Fraud attempts"
        value={String(stats.fraudAttempts)}
        icon={Fingerprint}
      />
      <StatWidget
        label="Suspicious accounts"
        value={String(stats.suspiciousAccounts)}
        icon={UserX}
      />
      <StatWidget
        label="Active rides"
        value={String(stats.highRiskRides)}
        icon={MapPin}
        accent="primary"
      />
      <StatWidget
        label="Blocked users"
        value={String(stats.blockedUsers)}
        icon={Ban}
      />
      <StatWidget
        label="Open incidents"
        value={String(stats.openIncidents)}
        icon={AlertTriangle}
      />
    </div>
  );
}
