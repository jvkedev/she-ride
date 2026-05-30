"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Star,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReportCaptainModal from "@/components/rider/shared/report-captain-modal";
import {
  getRiderRideDetails,
  type RiderRideDetails,
} from "@/services/rides/rides.service";

type RideDetailDialogProps = {
  rideId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatWhen(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function tripDuration(startedAt: string | null, completedAt: string | null) {
  if (!startedAt || !completedAt) return "—";
  const mins = Math.round(
    (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000,
  );
  return mins < 1 ? "< 1 min" : `${mins} min`;
}

export default function RideDetailDialog({
  rideId,
  open,
  onOpenChange,
}: RideDetailDialogProps) {
  const [ride, setRide] = useState<RiderRideDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !rideId) return;
    setLoading(true);
    setError(null);
    getRiderRideDetails(rideId)
      .then(setRide)
      .catch(() => setError("Could not load ride details"))
      .finally(() => setLoading(false));
  }, [open, rideId]);

  const fare = ride?.finalFare ?? ride?.estimatedFare ?? 0;
  const canReport =
    ride?.captain &&
    ride.status !== "SEARCHING" &&
    ride.status !== "CANCELED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ride details</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-10 text-neutral-400">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}

        {error && (
          <p className="py-8 text-center text-sm text-red-500">{error}</p>
        )}

        {ride && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  ride.status === "COMPLETED"
                    ? "bg-emerald-50 text-emerald-700"
                    : ride.status === "CANCELED"
                      ? "bg-red-50 text-red-600"
                      : "bg-primary/10 text-primary"
                }`}
              >
                {ride.status.replace("_", " ")}
              </span>
              <p className="text-lg font-semibold text-neutral-900">
                ₹{fare.toFixed(2)}
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-neutral-200 p-4">
              <div className="flex gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-neutral-900">
                    {ride.pickupAddress}
                  </p>
                  <p className="text-xs text-neutral-500">Pickup</p>
                </div>
              </div>
              <div className="flex gap-2 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900">
                    {ride.dropAddress}
                  </p>
                  <p className="text-xs text-neutral-500">Drop-off</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="flex items-center gap-1 text-xs text-neutral-500">
                  <Navigation className="size-3.5" />
                  Distance
                </p>
                <p className="mt-0.5 font-semibold">
                  {ride.distanceInKm?.toFixed(1) ?? "—"} km
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="flex items-center gap-1 text-xs text-neutral-500">
                  <Clock className="size-3.5" />
                  Duration
                </p>
                <p className="mt-0.5 font-semibold">
                  {tripDuration(ride.startedAt, ride.completedAt)}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="flex items-center gap-1 text-xs text-neutral-500">
                  <IndianRupee className="size-3.5" />
                  Payment
                </p>
                <p className="mt-0.5 font-semibold">
                  {ride.paymentMethod} · {ride.paymentStatus}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <p className="text-xs text-neutral-500">Vehicle</p>
                <p className="mt-0.5 font-semibold">{ride.vehicleType}</p>
              </div>
            </div>

            {ride.captain && (
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-sm font-semibold text-neutral-900">
                  Captain
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{ride.captain.name}</p>
                    <p className="flex items-center gap-1 text-sm text-neutral-500">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {ride.captain.rating?.toFixed(1) ?? "5.0"}
                      {ride.captain.vehicle
                        ? ` · ${ride.captain.vehicle.plate}`
                        : ""}
                    </p>
                    {ride.captain.vehicle && (
                      <p className="mt-1 text-xs text-neutral-500">
                        {ride.captain.vehicle.color}{" "}
                        {ride.captain.vehicle.brand}{" "}
                        {ride.captain.vehicle.model}
                      </p>
                    )}
                  </div>
                  <a
                    href={`tel:${ride.captain.phone}`}
                    className="rounded-lg border border-neutral-200 p-2 hover:bg-neutral-50"
                    aria-label="Call captain"
                  >
                    <Phone className="size-4" />
                  </a>
                </div>
              </div>
            )}

            <p className="text-xs text-neutral-500">
              {ride.completedAt
                ? `Completed ${formatWhen(ride.completedAt)}`
                : ride.cancelledAt
                  ? `Cancelled ${formatWhen(ride.cancelledAt)}`
                  : ride.startedAt
                    ? `Started ${formatWhen(ride.startedAt)}`
                    : null}
            </p>

            {canReport && rideId && (
              <ReportCaptainModal
                rideId={rideId}
                captainName={ride.captain?.name}
                className="w-full"
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
