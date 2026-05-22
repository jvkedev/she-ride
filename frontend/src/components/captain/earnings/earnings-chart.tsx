import CaptainCard from "@/components/captain/shared/captain-card";
import { weeklyEarnings } from "@/lib/captain/captain-mock-data";
import { captainHeading } from "@/lib/captain/captain-styles";

export default function EarningsChart() {
  const max = Math.max(...weeklyEarnings.map((d) => d.amount));

  return (
    <CaptainCard>
      <h2 className={captainHeading}>Weekly earnings</h2>
      <div className="mt-6 flex items-end justify-between gap-2">
        {weeklyEarnings.map((day) => {
          const height = Math.round((day.amount / max) * 100);
          return (
            <div
              key={day.day}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-32 w-full items-end justify-center">
                <div
                  className="w-full max-w-8 rounded-t-md bg-primary/80 transition hover:bg-primary"
                  style={{ height: `${height}%`, minHeight: 8 }}
                  title={`₹${day.amount}`}
                />
              </div>
              <span className="text-[10px] font-medium text-neutral-500">
                {day.day}
              </span>
            </div>
          );
        })}
      </div>
    </CaptainCard>
  );
}
