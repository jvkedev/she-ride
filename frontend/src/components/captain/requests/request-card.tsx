import { MapPin, Star } from "lucide-react";

import RequestActions from "@/components/captain/requests/request-actions";
import RequestTimer from "@/components/captain/requests/request-timer";
import CaptainCard from "@/components/captain/shared/captain-card";
import { Badge } from "@/components/ui/badge";
import { captainHeading, captainMutedText } from "@/lib/captain/captain-styles";

export type RideRequest = {
  id: string;
  passengerName: string;
  passengerRating: number;
  fare: number;
  distance: string;
  vehicleType: string;
  paymentMethod: string;
  eta: string;
  pickup: string;
  dropoff: string;
};

type RequestCardProps = {
  request: RideRequest;
  showTimer?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
};

export default function RequestCard({
  request,
  showTimer = false,
  onAccept,
  onDecline,
}: RequestCardProps) {
  return (
    <CaptainCard className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={captainHeading}>{request.passengerName}</h3>
          <p className={`${captainMutedText} mt-0.5 flex items-center gap-1`}>
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {request.passengerRating}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-neutral-900">₹{request.fare}</p>
          <p className={captainMutedText}>{request.distance}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="rounded-md border-neutral-200">
          {request.vehicleType}
        </Badge>
        <Badge variant="outline" className="rounded-md border-neutral-200 capitalize">
          {request.paymentMethod}
        </Badge>
        <Badge variant="outline" className="rounded-md border-neutral-200">
          ETA {request.eta}
        </Badge>
      </div>

      <div className="space-y-2 rounded-lg bg-neutral-50 p-3">
        <div className="flex gap-2 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <span className="text-neutral-700">{request.pickup}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className="text-neutral-700">{request.dropoff}</span>
        </div>
      </div>

      {showTimer ? <RequestTimer /> : null}

      <RequestActions onAccept={onAccept} onDecline={onDecline} />
    </CaptainCard>
  );
}
