import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

import CaptainCard from "@/components/captain/shared/captain-card";
import CaptainStatusBadge from "@/components/captain/shared/captain-status-badge";
import { Button } from "@/components/ui/button";
import { activeRide } from "@/lib/captain/captain-mock-data";
import { captainHeading, captainMutedText } from "@/lib/captain/captain-styles";

export default function CaptainCurrentRide() {
  return (
    <CaptainCard>
      <div className="flex items-center justify-between gap-2">
        <h2 className={captainHeading}>Active ride</h2>
        <CaptainStatusBadge status="busy" />
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-neutral-900">
            {activeRide.passengerName}
          </p>
          <p className={captainMutedText}>OTP {activeRide.otp}</p>
        </div>

        <div className="space-y-2 rounded-lg bg-neutral-50 p-3">
          <div className="flex gap-2 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span className="text-neutral-700">{activeRide.pickup}</span>
          </div>
          <div className="flex gap-2 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-neutral-700">{activeRide.dropoff}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-neutral-900">
            ₹{activeRide.fare}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="icon-sm" className="rounded-lg">
              <Phone className="size-4" />
              <span className="sr-only">Call passenger</span>
            </Button>
            <Button asChild size="sm" className="rounded-lg">
              <Link href="/captain/active-ride">Track ride</Link>
            </Button>
          </div>
        </div>
      </div>
    </CaptainCard>
  );
}
