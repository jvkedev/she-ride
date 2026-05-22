import CaptainCard from "@/components/captain/shared/captain-card";
import { captainHeading } from "@/lib/captain/captain-styles";

const stats = [
  { label: "Total trips", value: "68" },
  { label: "Avg. per trip", value: "₹264" },
  { label: "Peak hours", value: "6.2h" },
  { label: "Completion rate", value: "98%" },
];

export default function WeeklyStats() {
  return (
    <CaptainCard>
      <h2 className={captainHeading}>This week</h2>
      <dl className="mt-4 grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-xs text-neutral-500">{stat.label}</dt>
            <dd className="mt-0.5 text-lg font-semibold text-neutral-900">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </CaptainCard>
  );
}
