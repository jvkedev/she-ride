import { ShieldAlert } from "lucide-react";

import CaptainCard from "@/components/captain/shared/captain-card";
import SosTriggerButton from "@/components/shared/safety/sos-trigger-button";
import { captainHeading } from "@/lib/captain/captain-styles";

export default function EmergencySosCard({ compact }: { compact?: boolean }) {
  return (
    <CaptainCard
      className={compact ? "border-red-100 bg-red-50/40" : "border-red-100 bg-red-50/50"}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-red-100">
          <ShieldAlert className="size-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h2 className={captainHeading}>Emergency SOS</h2>
          <p className="text-sm text-neutral-600">
            Alert support and your trusted contacts instantly
          </p>
        </div>
      </div>
      <SosTriggerButton className="mt-4" />
    </CaptainCard>
  );
}
