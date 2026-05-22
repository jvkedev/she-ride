import RequestCard from "@/components/captain/requests/request-card";
import CaptainEmptyState from "@/components/captain/shared/captain-empty-state";
import type { RideRequest } from "@/lib/captain/captain-mock-data";
import { Zap } from "lucide-react";

type RequestListProps = {
  requests: RideRequest[];
  showTimer?: boolean;
  compact?: boolean;
};

export default function RequestList({
  requests,
  showTimer = false,
  compact = false,
}: RequestListProps) {
  if (requests.length === 0) {
    return (
      <CaptainEmptyState
        icon={Zap}
        title="No ride requests"
        description="Stay online to receive nearby booking requests."
      />
    );
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          showTimer={showTimer}
        />
      ))}
    </div>
  );
}
