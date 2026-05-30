"use client";

import { useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTrigger() {
    if (loading) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await triggerSosWithLiveLocation({ rideId });
      setMessage(
        "SOS sent with your live GPS location. Support has been alerted.",
      );
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
      {message && (
        <p className="text-xs font-medium text-emerald-700">{message}</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
