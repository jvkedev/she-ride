import CaptainCard from "@/components/captain/shared/captain-card";
import { captainHeading } from "@/lib/captain/captain-styles";
import { CaptainEarningsSummary } from "@/services/captain/captain-earnings.service";

interface EarningsBreakdownProps {
  summary?: CaptainEarningsSummary | null;
  loading?: boolean;
}

export default function EarningsBreakdown({
  summary,
  loading,
}: EarningsBreakdownProps) {
  const netPayout = summary?.netPayout ?? 0;
  const tripFares = summary?.tripFares ?? 0;

  const breakdown = loading
    ? [
        { label: "Trip fares", amount: 0 },
        { label: "Net payout", amount: 0, highlight: true },
      ]
    : [
        { label: "Trip fares", amount: tripFares },
        { label: "Net payout", amount: netPayout, highlight: true },
      ];

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
