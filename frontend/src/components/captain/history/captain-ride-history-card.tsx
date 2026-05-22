import CaptainCard from "@/components/captain/shared/captain-card";
import CaptainStatusBadge from "@/components/captain/shared/captain-status-badge";
import { captainMutedText } from "@/lib/captain/captain-styles";

type CaptainRideHistoryCardProps = {
  passenger: string;
  route: string;
  fare: number;
  date: string;
  status: "completed" | "cancelled";
};

export default function CaptainRideHistoryCard({
  passenger,
  route,
  fare,
  date,
  status,
}: CaptainRideHistoryCardProps) {
  return (
    <CaptainCard padding="sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-900">{passenger}</p>
          <p className={`${captainMutedText} mt-0.5 truncate`}>{route}</p>
          <p className="mt-1 text-xs text-neutral-400">{date}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-neutral-900">₹{fare}</p>
          <CaptainStatusBadge
            status={status}
            className="mt-2"
          />
        </div>
      </div>
    </CaptainCard>
  );
}
