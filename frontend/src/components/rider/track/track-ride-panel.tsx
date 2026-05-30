"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  Clock,
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Share2,
  Star,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import ReportCaptainModal from "@/components/rider/shared/report-captain-modal";
import SosTriggerButton from "@/components/shared/safety/sos-trigger-button";
import type { RiderActiveRide } from "@/services/rides/rides.service";
import { cancelRide } from "@/services/rides/rides.service";
import { cn } from "@/lib/utils";

function TrackCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-4",
        className,
      )}
    >
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

const STATUS_LABELS: Record<string, string> = {
  SEARCHING: "Finding captain",
  ACCEPTED: "Captain on the way",
  ARRIVING: "Captain arriving",
  IN_PROGRESS: "On trip",
  COMPLETED: "Completed",
  CANCELED: "Cancelled",
};

const TIMELINE_STEPS = [
  { key: "SEARCHING", label: "Ride requested" },
  { key: "ACCEPTED", label: "Captain assigned" },
  { key: "ARRIVING", label: "Captain at pickup" },
  { key: "IN_PROGRESS", label: "Heading to destination" },
  { key: "COMPLETED", label: "Trip complete" },
];

const STATUS_ORDER = TIMELINE_STEPS.map((s) => s.key);

type TrackRidePanelProps = {
  ride: RiderActiveRide;
  etaMinutes?: number | null;
};

export default function TrackRidePanel({
  ride,
  etaMinutes,
}: TrackRidePanelProps) {
  const router = useRouter();
  const [canceling, setCanceling] = useState(false);
  const currentIndex = STATUS_ORDER.indexOf(ride.status);
  const captain = ride.captain;
  const vehicleLabel = ride.vehicleType ?? "Ride";
  const canCancel = ["SEARCHING", "ACCEPTED", "ARRIVING"].includes(ride.status);
  const canReport = Boolean(captain && ride.status !== "SEARCHING");

  async function handleCancel() {
    if (!canCancel || canceling) return;
    setCanceling(true);
    try {
      await cancelRide(ride.rideId, "Cancelled by rider");
      router.replace("/rider");
    } catch {
      setCanceling(false);
    }
  }

  return (
    <div className="flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-neutral-900">
            Track your ride
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {vehicleLabel} · {STATUS_LABELS[ride.status] ?? ride.status}
          </p>
        </div>
        {ride.status !== "SEARCHING" && ride.status !== "COMPLETED" && (
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Live
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <Clock className="size-3.5" />
            {etaMinutes != null ? "ETA" : "Status"}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-900">
            {etaMinutes != null
              ? `~${Math.max(1, Math.round(etaMinutes))} min`
              : STATUS_LABELS[ride.status] ?? ride.status}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <Navigation className="size-3.5" />
            Distance
          </p>
          <p className="mt-0.5 text-lg font-semibold text-neutral-900">
            {ride.distanceInKm?.toFixed(1) ?? "—"} km
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <IndianRupee className="size-3.5" />
            Fare
          </p>
          <p className="mt-0.5 text-lg font-semibold text-neutral-900">
            ₹{ride.estimatedFare?.toFixed(0) ?? "—"}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-primary/5 px-3 py-2.5">
          <p className="text-xs text-neutral-500">Payment</p>
          <p className="mt-0.5 text-sm font-semibold text-primary">
            {ride.paymentMethod}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <TrackCard title="Route">
          <div className="space-y-3">
            <div className="flex gap-2.5 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="font-medium text-neutral-900 line-clamp-2">
                  {ride.pickupAddress}
                </p>
                <p className="text-xs text-neutral-500">Pickup</p>
              </div>
            </div>
            <div className="ml-2 border-l-2 border-dashed border-neutral-200 pl-4">
              <div className="flex gap-2.5 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-400" />
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900 line-clamp-2">
                    {ride.dropAddress}
                  </p>
                  <p className="text-xs text-neutral-500">Drop-off</p>
                </div>
              </div>
            </div>
          </div>
        </TrackCard>

        {captain && (
          <TrackCard title="Your captain">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-neutral-200">
                <Car className="size-5 text-neutral-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900">{captain.name}</p>
                <p className="flex items-center gap-1 text-sm text-neutral-500">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {captain.rating?.toFixed(1) ?? "5.0"}
                  {captain.vehicle ? ` · ${captain.vehicle.plate}` : ""}
                </p>
                {captain.vehicle && (
                  <p className="mt-1 text-xs text-neutral-500">
                    {captain.vehicle.color} {captain.vehicle.brand}{" "}
                    {captain.vehicle.model}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="icon-sm"
                className="size-10 rounded-lg border-neutral-200"
                asChild
              >
                <a href={`tel:${captain.phone}`} aria-label="Call captain">
                  <Phone className="size-4" />
                </a>
              </Button>
            </div>
          </TrackCard>
        )}

        <TrackCard title="Trip progress">
          <ol className="space-y-2">
            {TIMELINE_STEPS.map((step, index) => {
              const done = currentIndex >= index;
              return (
                <li
                  key={step.key}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                    done
                      ? "bg-primary/5 font-medium text-neutral-900"
                      : "bg-neutral-50 text-neutral-500",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      done
                        ? "bg-primary text-white"
                        : "border border-neutral-200 text-neutral-400",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="truncate">{step.label}</span>
                </li>
              );
            })}
          </ol>
        </TrackCard>
      </div>

      <div className="mt-5 space-y-2">
        <Button
          variant="outline"
          className="h-11 w-full gap-2 rounded-lg font-semibold"
          onClick={() => {
            const text = `She Ride: ${STATUS_LABELS[ride.status] ?? ride.status}. Pickup: ${ride.pickupAddress}. Drop: ${ride.dropAddress}`;
            if (navigator.share) {
              void navigator.share({ title: "She Ride trip", text });
            } else {
              void navigator.clipboard.writeText(text);
            }
          }}
        >
          <Share2 className="size-4" />
          Share trip status
        </Button>

        {canReport && (
          <ReportCaptainModal
            rideId={ride.rideId}
            captainName={captain?.name}
            className="w-full"
          />
        )}

        <SosTriggerButton rideId={ride.rideId} label="Emergency SOS" />

        {canCancel && (
          <Button
            variant="outline"
            className="h-11 w-full gap-2 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => void handleCancel()}
            disabled={canceling}
          >
            {canceling ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <X className="size-4" />
            )}
            Cancel ride
          </Button>
        )}
      </div>
    </div>
  );
}
