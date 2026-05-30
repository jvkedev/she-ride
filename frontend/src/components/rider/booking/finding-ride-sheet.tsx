"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  MapPin,
  Radio,
  Search,
  UserCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { connectSocket, joinRideRoom } from "@/services/socket/socket.service";
import ReportCaptainModal from "@/components/rider/shared/report-captain-modal";
import { cancelRide } from "@/services/rides/rides.service";
import { formatDuration } from "@/services/routing/routing.service";
import type { CaptainInfo } from "@/lib/ride/captain-types";

export type { CaptainInfo };

type SearchStep =
  | "SCANNING"
  | "BROADCASTING"
  | "WAITING"
  | "FOUND"
  | "ACCEPTED"
  | "ARRIVING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED";

type FindingRideSheetProps = {
  rideId: string;
  pickupLabel?: string;
  dropLabel?: string;
  initialStatus?: string;
  etaMinutes?: number | null;
  onCanceled?: () => void;
  onCompleted?: () => void;
  onCaptainUpdate?: (captain: CaptainInfo | null) => void;
  onRideStatusChange?: (status: string) => void;
};

const STEPS: { id: SearchStep; label: string }[] = [
  { id: "SCANNING", label: "Searching nearby captains" },
  { id: "BROADCASTING", label: "Sending ride requests" },
  { id: "WAITING", label: "Waiting for captain response" },
  { id: "FOUND", label: "Captain found" },
];

function statusToStep(status: string): SearchStep {
  if (
    ["SCANNING", "BROADCASTING", "WAITING", "FOUND"].includes(status)
  ) {
    return status as SearchStep;
  }
  return status as SearchStep;
}

export default function FindingRideSheet({
  rideId,
  pickupLabel,
  dropLabel,
  initialStatus = "SEARCHING",
  etaMinutes,
  onCanceled,
  onCompleted,
  onCaptainUpdate,
  onRideStatusChange,
}: FindingRideSheetProps) {
  const [currentStep, setCurrentStep] = useState<SearchStep>(
    initialStatus === "SEARCHING" ? "SCANNING" : statusToStep(initialStatus),
  );
  const [rideStatus, setRideStatus] = useState(initialStatus);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(45);
  const [nearbyCount, setNearbyCount] = useState<number | null>(null);
  const [captain, setCaptain] = useState<CaptainInfo | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSearching = ["SEARCHING"].includes(rideStatus);
  const canCancel = ["SEARCHING", "ACCEPTED", "ARRIVING"].includes(rideStatus);

  const activeStepIndex = useMemo(() => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    return idx >= 0 ? idx : 0;
  }, [currentStep]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    let userId: string | null = null;
    try {
      userId = JSON.parse(atob(token.split(".")[1])).sub;
    } catch {
      return;
    }

    if (!userId) return;

    const socket = connectSocket(userId);
    joinRideRoom(rideId);

    const onSearching = (data: {
      step: string;
      label?: string;
      etaSeconds?: number;
      nearbyCaptains?: number;
    }) => {
      setCurrentStep(statusToStep(data.step));
      if (data.etaSeconds != null) setEtaSeconds(data.etaSeconds);
      if (data.nearbyCaptains != null) setNearbyCount(data.nearbyCaptains);
    };

    const onAccepted = (data: {
      status: string;
      captain?: CaptainInfo;
    }) => {
      setRideStatus(data.status);
      setCurrentStep("FOUND");
      const nextCaptain = data.captain ?? null;
      setCaptain(nextCaptain);
      onCaptainUpdate?.(nextCaptain);
      onRideStatusChange?.(data.status);
    };

    const onStatus = (data: { status: string }) => {
      setRideStatus(data.status);
      setCurrentStep(statusToStep(data.status));
      onRideStatusChange?.(data.status);
      if (data.status === "COMPLETED") onCompleted?.();
      if (data.status === "CANCELED") {
        setCaptain(null);
        onCaptainUpdate?.(null);
        onCanceled?.();
      }
    };

    socket.on("ride:searching", onSearching);
    socket.on("ride:accepted", onAccepted);
    socket.on("ride:status", onStatus);

    if (isSearching) {
      const t1 = setTimeout(
        () => setCurrentStep((s) => (s === "SCANNING" ? "BROADCASTING" : s)),
        800,
      );
      const t2 = setTimeout(
        () => setCurrentStep((s) => (s === "BROADCASTING" ? "WAITING" : s)),
        1800,
      );
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        socket.off("ride:searching", onSearching);
        socket.off("ride:accepted", onAccepted);
        socket.off("ride:status", onStatus);
      };
    }

    return () => {
      socket.off("ride:searching", onSearching);
      socket.off("ride:accepted", onAccepted);
      socket.off("ride:status", onStatus);
    };
  }, [
    rideId,
    isSearching,
    onCanceled,
    onCompleted,
    onCaptainUpdate,
    onRideStatusChange,
  ]);

  async function handleCancel() {
    if (!canCancel) return;
    setCanceling(true);
    setError(null);
    try {
      await cancelRide(rideId, "Cancelled by rider");
      setRideStatus("CANCELED");
      onCanceled?.();
    } catch {
      setError("Could not cancel ride. Please try again.");
    } finally {
      setCanceling(false);
    }
  }

  const statusTitle = isSearching
    ? "Finding your ride…"
    : rideStatus === "ACCEPTED"
      ? "Captain assigned"
      : rideStatus === "ARRIVING"
        ? "Captain is on the way"
        : rideStatus === "IN_PROGRESS"
          ? "Ride in progress"
          : rideStatus === "COMPLETED"
            ? "Ride completed"
            : "Ride update";

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-[1100] flex max-h-[min(72dvh,520px)] flex-col rounded-t-3xl border border-neutral-200 bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.12)]">
      <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-neutral-300" />

      <div className="rider-panel-scroll flex-1 overflow-y-auto px-5 pb-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {statusTitle}
            </h2>
            {isSearching && (
              <p className="mt-0.5 text-sm text-neutral-500">
                {etaSeconds != null
                  ? `Est. wait ~${formatDuration(Math.max(1, Math.ceil(etaSeconds / 60)))}`
                  : "Matching you with a nearby captain"}
                {nearbyCount != null && nearbyCount > 0
                  ? ` · ${nearbyCount} captains nearby`
                  : ""}
              </p>
            )}
            {!isSearching && etaMinutes != null && (
              <p className="mt-0.5 text-sm text-neutral-500">
                ETA ~{formatDuration(etaMinutes)}
              </p>
            )}
          </div>
          {isSearching && (
            <div className="relative flex size-12 shrink-0 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-pink-200 opacity-60" />
              <span className="relative flex size-10 items-center justify-center rounded-full bg-pink-500 text-white">
                <Search className="size-5 animate-pulse" />
              </span>
            </div>
          )}
        </div>

        {(pickupLabel || dropLabel) && (
          <div className="mt-4 space-y-2 rounded-xl bg-neutral-50 p-3 text-sm">
            {pickupLabel && (
              <p className="flex gap-2 text-neutral-700">
                <MapPin className="mt-0.5 size-4 shrink-0 text-blue-500" />
                <span className="line-clamp-2">{pickupLabel}</span>
              </p>
            )}
            {dropLabel && (
              <p className="flex gap-2 text-neutral-700">
                <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <span className="line-clamp-2">{dropLabel}</span>
              </p>
            )}
          </div>
        )}

        {isSearching && (
          <ol className="mt-5 space-y-3">
            {STEPS.map((step, index) => {
              const done = index < activeStepIndex;
              const active = index === activeStepIndex;
              return (
                <li key={step.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-500",
                      done && "bg-pink-500 text-white",
                      active &&
                        "bg-pink-100 text-pink-600 ring-2 ring-pink-400 ring-offset-1",
                      !done && !active && "bg-neutral-100 text-neutral-400",
                    )}
                  >
                    {done ? (
                      <UserCheck className="size-4" />
                    ) : active ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-sm transition-colors",
                      active
                        ? "font-semibold text-neutral-900"
                        : done
                          ? "text-neutral-600"
                          : "text-neutral-400",
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {!isSearching && rideStatus !== "COMPLETED" && !captain && (
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { s: "ACCEPTED", l: "Captain assigned" },
              { s: "ARRIVING", l: "Captain en route to pickup" },
              { s: "IN_PROGRESS", l: "Heading to destination" },
            ].map((item) => {
              const order = ["ACCEPTED", "ARRIVING", "IN_PROGRESS"];
              const done = order.indexOf(rideStatus) >= order.indexOf(item.s);
              return (
                <li
                  key={item.s}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2",
                    done ? "bg-pink-50 font-medium text-neutral-800" : "text-neutral-400",
                  )}
                >
                  <Radio className="size-3.5" />
                  {item.l}
                </li>
              );
            })}
          </ul>
        )}

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
      </div>

      <div className="shrink-0 space-y-2 border-t border-neutral-100 px-5 py-4">
        {captain && rideStatus !== "SEARCHING" && (
          <ReportCaptainModal
            rideId={rideId}
            captainName={captain.name}
            trigger={
              <Button variant="outline" className="h-11 w-full rounded-xl">
                Report captain
              </Button>
            }
          />
        )}
        {canCancel && (
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
            onClick={handleCancel}
            disabled={canceling}
          >
            {canceling ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <X className="mr-2 size-4" />
            )}
            Cancel ride request
          </Button>
        )}
      </div>
    </div>
  );
}
