import SecurityActivityFeed from "@/components/security/overview/security-activity-feed";
import SecurityAlertsChart from "@/components/security/overview/security-alerts-chart";
import SecurityOverviewStats from "@/components/security/overview/security-overview-stats";
import AlertCard from "@/components/shared/security/alert-card";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";
import { sosAlerts } from "@/lib/security/mock-data";

export default function SecurityOverviewPage() {
  const criticalSos = sosAlerts.find((a) => a.priority === "critical");

  return (
    <DashboardPageLayout
      title="Security overview"
      description="Real-time trust & safety monitoring for She Ride."
      wide
    >
      <SecurityOverviewStats />
      {criticalSos ? (
        <AlertCard
          title={`Critical SOS · ${criticalSos.rideId}`}
          description={`${criticalSos.riderName} · ${criticalSos.location}`}
          priority="critical"
          time={criticalSos.triggeredAt}
          pulse
        />
      ) : null}
      <SecurityAlertsChart />
      <SecurityActivityFeed />
    </DashboardPageLayout>
  );
}
