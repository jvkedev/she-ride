// components/security/fraud/fraud-risk-cards.tsx
"use client";

import { Globe, MapPin, Smartphone, Users, AlertTriangle } from "lucide-react";
import StatWidget from "@/components/shared/dashboard/stat-widget";
import { useFraudStats } from "@/lib/security/use-fraud";

// Each card maps to a field returned by GET /security/fraud/stats.
// The backend returns: { open, underReview, resolvedToday, critical }
//
// If you want the original signal-type breakdown (GPS spoofing / multi-account
// / payment fraud / VPN), add those counters to getFraudStats() in the backend
// and expand FraudStats in fraud-api.ts accordingly.

export default function FraudRiskCards() {
  const { data, isLoading, isError } = useFraudStats();

  // Helper so widgets show a skeleton "—" while loading
  const val = (n?: number) => {
    if (isLoading) return "—";
    if (isError) return "!";
    return String(n ?? 0);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatWidget
        label="Open cases"
        value={val(data?.open)}
        icon={AlertTriangle}
        accent="primary"
      />
      <StatWidget
        label="Under review"
        value={val(data?.underReview)}
        icon={Users}
      />
      <StatWidget
        label="Resolved today"
        value={val(data?.resolvedToday)}
        icon={Smartphone}
      />
      <StatWidget
        label="Critical risk"
        value={val(data?.critical)}
        icon={Globe}
      />
    </div>
  );
}
