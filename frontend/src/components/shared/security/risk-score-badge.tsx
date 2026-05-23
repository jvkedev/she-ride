import { cn } from "@/lib/utils";

type RiskScoreBadgeProps = {
  score: number;
  className?: string;
};

export default function RiskScoreBadge({ score, className }: RiskScoreBadgeProps) {
  const level =
    score >= 80 ? "critical" : score >= 60 ? "high" : score >= 40 ? "medium" : "low";

  const colors = {
    critical: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums",
        colors[level],
        className,
      )}
    >
      {score}
      <span className="font-medium opacity-70">/100</span>
    </span>
  );
}
