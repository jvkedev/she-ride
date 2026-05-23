import {
  AlertTriangle,
  Ban,
  Fingerprint,
  MapPin,
  ShieldAlert,
  UserX,
} from "lucide-react";

import StatWidget from "@/components/shared/dashboard/stat-widget";
import { securityOverviewStats } from "@/lib/security/mock-data";

export default function SecurityOverviewStats() {
  const s = securityOverviewStats;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatWidget label="Active SOS" value={String(s.activeSos)} icon={ShieldAlert} accent="primary" />
      <StatWidget label="Fraud attempts" value={String(s.fraudAttempts)} icon={Fingerprint} />
      <StatWidget label="Suspicious accounts" value={String(s.suspiciousAccounts)} icon={UserX} />
      <StatWidget label="High-risk rides" value={String(s.highRiskRides)} icon={MapPin} accent="primary" />
      <StatWidget label="Blocked users" value={String(s.blockedUsers)} icon={Ban} />
      <StatWidget label="Open incidents" value={String(s.openIncidents)} icon={AlertTriangle} />
    </div>
  );
}
