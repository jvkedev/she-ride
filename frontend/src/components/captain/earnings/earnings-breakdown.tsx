import CaptainCard from "@/components/captain/shared/captain-card";
import { todayEarningsSummary } from "@/lib/captain/captain-mock-data";
import { captainHeading } from "@/lib/captain/captain-styles";

const breakdown = [
  { label: "Trip fares", amount: todayEarningsSummary.total - todayEarningsSummary.incentives },
  { label: "Incentives & bonuses", amount: todayEarningsSummary.incentives },
  { label: "Platform fee", amount: -120 },
  { label: "Net payout", amount: todayEarningsSummary.netPayout, highlight: true },
];

export default function EarningsBreakdown() {
  return (
    <CaptainCard>
      <h2 className={captainHeading}>Today&apos;s breakdown</h2>
      <ul className="mt-4 space-y-3">
        {breakdown.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between text-sm"
          >
            <span
              className={
                row.highlight
                  ? "font-semibold text-neutral-900"
                  : "text-neutral-600"
              }
            >
              {row.label}
            </span>
            <span
              className={
                row.highlight
                  ? "font-semibold text-neutral-900"
                  : row.amount < 0
                    ? "text-red-600"
                    : "font-medium text-neutral-900"
              }
            >
              {row.amount < 0 ? "-" : row.highlight ? "" : "+"}₹
              {Math.abs(row.amount).toLocaleString("en-IN")}
            </span>
          </li>
        ))}
      </ul>
    </CaptainCard>
  );
}
