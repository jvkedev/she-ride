import CaptainCard from "@/components/captain/shared/captain-card";
import { captainHeading } from "@/lib/captain/captain-styles";
import { CaptainEarningsStats } from "@/services/captain/captain-earnings.service";

interface WeeklyStatsProps {
  stats?: CaptainEarningsStats | null;
  loading?: boolean;
}

export default function WeeklyStats({ stats, loading }: WeeklyStatsProps) {
  const items = loading
    ? [
        { label: "Total trips", value: "Loading..." },
        { label: "Avg. per trip", value: "Loading..." },
        { label: "Peak hours", value: "Loading..." },
        { label: "Completion rate", value: "Loading..." },
      ]
    : [
        { label: "Total trips", value: `${stats?.totalTrips ?? 0}` },
        {
          label: "Avg. per trip",
          value: `₹${stats?.avgPerTrip?.toLocaleString("en-IN") ?? 0}`,
        },
        { label: "Peak hours", value: stats?.peakHours ?? "—" },
        { label: "Completion rate", value: stats?.completionRate ?? "—" },
      ];

  return (
    <CaptainCard>
      <h2 className={captainHeading}>This week</h2>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-xs text-neutral-500">{item.label}</dt>
            <dd className="mt-0.5 text-lg font-semibold text-neutral-900">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </CaptainCard>
  );
}
