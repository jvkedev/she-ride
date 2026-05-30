"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import SosLiveTracker, {
  clearStoredActiveSosId,
  getStoredActiveSosId,
} from "@/components/shared/safety/sos-live-tracker";
import { triggerSosWithLiveLocation } from "@/services/security/sos-trigger.service";
import { cn } from "@/lib/utils";

type SosTriggerButtonProps = {
  rideId?: string;
  className?: string;
  fullWidth?: boolean;
  label?: string;
};

export default function SosTriggerButton({
  rideId,
  className,
  fullWidth = true,
  label = "Trigger SOS",
}: SosTriggerButtonProps) {
  const [loading, setLoading] = useState(false);
  const [activeSosId, setActiveSosId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredActiveSosId();
    if (stored) setActiveSosId(stored);
  }, []);

  async function handleTrigger() {
    if (loading || activeSosId) return;
    setLoading(true);
    setError(null);

    try {
      const alert = await triggerSosWithLiveLocation({ rideId });
      setActiveSosId(alert.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send SOS. Allow location access and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleResolved() {
    setActiveSosId(null);
    clearStoredActiveSosId();
  }

  if (activeSosId) {
    return (
      <div className={cn("space-y-3", className)}>
        <SosLiveTracker sosAlertId={activeSosId} onResolved={handleResolved} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        variant="destructive"
        className={cn(
          "h-11 rounded-lg font-semibold",
          fullWidth && "w-full",
        )}
        onClick={() => void handleTrigger()}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <ShieldAlert className="mr-2 size-4" />
        )}
        {loading ? "Sending live location…" : label}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
