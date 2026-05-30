"use client";

import Link from "next/link";

import SecurityActivityFeed from "@/components/security/overview/security-activity-feed";
import SecurityAlertsChart from "@/components/security/overview/security-alerts-chart";
import SecurityOverviewStats from "@/components/security/overview/security-overview-stats";
import AlertCard from "@/components/shared/security/alert-card";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";
import { mapSosAlerts } from "@/lib/security/sos-utils";
import { useActiveSos } from "@/hooks/security/use-sos";

export default function SecurityOverviewPage() {
  const { data } = useActiveSos();
  const active = mapSosAlerts(data ?? []);
  const criticalSos = active[0];

  return (
    <DashboardPageLayout title="Security overview" wide>
      <SecurityOverviewStats />
      {criticalSos ? (
        <AlertCard
          title={`Active SOS · ${criticalSos.rideId}`}
          description={`${criticalSos.riderName} · ${criticalSos.location}`}
          priority="critical"
          time={criticalSos.triggeredAt}
          pulse
          actions={
            <Link
              href="/security/sos"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90"
            >
              Open SOS center
            </Link>
          }
        />
      ) : null}
      <SecurityAlertsChart />
      <SecurityActivityFeed />
    </DashboardPageLayout>
  );
}
