"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Loader2 } from "lucide-react";

import CaptainCard from "@/components/captain/shared/captain-card";
import CaptainStatusBadge from "@/components/captain/shared/captain-status-badge";
import { Button } from "@/components/ui/button";
import { captainHeading, captainMutedText } from "@/lib/captain/captain-styles";
import { useCaptainStore } from "@/store/captain.store";
import {
  getActiveRide,
  markArrived,
  startRide,
  completeRide,
  cancelRideAsCaptain,
  type ActiveRideDetails,
} from "@/services/captain/captain-rides.service";

export default function CaptainCurrentRide() {
  const { activeRideId, setActiveRideId } = useCaptainStore();
  const [ride, setRide] = useState<ActiveRideDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeRideId) {
      setRide(null);
      return;
    }

    async function fetchRide() {
      try {
        setLoading(true);
        const details = await getActiveRide(activeRideId!);
        setRide(details);
      } catch {
        setError("Failed to load ride details");
      } finally {
        setLoading(false);
      }
    }

    fetchRide();
  }, [activeRideId]);

  if (!activeRideId) return null;

  if (loading) {
    return (
      <CaptainCard>
        <div className="flex items-center gap-2 py-4 text-neutral-400">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm">Loading ride...</span>
        </div>
      </CaptainCard>
    );
  }

  if (!ride) return null;

  async function handleArrived() {
    try {
      setActionLoading(true);
      await markArrived(ride!.rideId);
      setRide((r) => (r ? { ...r, status: "ARRIVING" } : r));
    } catch {
      setError("Failed to mark arrived");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStart() {
    if (!otp || otp.length < 4) {
      setError("Enter the 4-digit OTP");
      return;
    }
    try {
      setActionLoading(true);
      setError("");
      await startRide(ride!.rideId, otp);
      setRide((r) => (r ? { ...r, status: "IN_PROGRESS" } : r));
      setOtp("");
    } catch {
      setError("Invalid OTP. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleComplete() {
    if (!confirm("Complete this ride?")) return;
    try {
      setActionLoading(true);
      await completeRide(ride!.rideId);
      setRide((r) => (r ? { ...r, status: "COMPLETED" } : r));
      setTimeout(() => {
        setActiveRideId(null);
        setRide(null);
      }, 2000);
    } catch {
      setError("Failed to complete ride");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel this ride?")) return;
    try {
      setActionLoading(true);
      await cancelRideAsCaptain(ride!.rideId, "Cancelled by captain");
      setActiveRideId(null);
      setRide(null);
    } catch {
      setError("Failed to cancel ride");
    } finally {
      setActionLoading(false);
    }
  }

  const fare = ride.finalFare ?? ride.estimatedFare;
  const isCancellable = ["ACCEPTED", "ARRIVING"].includes(ride.status);

  return (
    <CaptainCard>
      <div className="flex items-center justify-between gap-2">
        <h2 className={captainHeading}>Active ride</h2>
        <CaptainStatusBadge status="busy" />
      </div>

      <div className="mt-4 space-y-3">
        {/* Rider info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-900">
              {ride.rider.name}
            </p>
            <p className={captainMutedText}>{ride.rider.phone}</p>
          </div>
          <a href={`tel:${ride.rider.phone}`}>
            <Button variant="outline" size="icon-sm" className="rounded-lg">
              <Phone className="size-4" />
              <span className="sr-only">Call passenger</span>
            </Button>
          </a>
        </div>

        {/* Addresses */}
        <div className="space-y-2 rounded-lg bg-neutral-50 p-3">
          <div className="flex gap-2 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span className="text-neutral-700 line-clamp-1">
              {ride.pickupAddress.split(",")[0]}
            </span>
          </div>
          <div className="flex gap-2 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="text-neutral-700 line-clamp-1">
              {ride.dropAddress.split(",")[0]}
            </span>
          </div>
        </div>

        {/* Fare + distance */}
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-neutral-900">
            ₹{fare?.toFixed(2) ?? "—"}
          </p>
          <p className={captainMutedText}>
            {ride.distanceInKm?.toFixed(1)} km · {ride.paymentMethod}
          </p>
        </div>

        {/* Error */}
        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Action buttons based on status */}
        <div className="space-y-2 pt-1">
          {/* ACCEPTED → Arrived button */}
          {ride.status === "ACCEPTED" && (
            <Button
              className="w-full rounded-xl"
              onClick={handleArrived}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              I've Arrived
            </Button>
          )}

          {/* ARRIVING → OTP input + Start */}
          {ride.status === "ARRIVING" && (
            <div className="space-y-2">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setError("");
                  setOtp(e.target.value.replace(/\D/g, ""));
                }}
                placeholder="Enter rider OTP"
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-center text-lg font-semibold tracking-widest outline-none focus:border-primary"
              />
              <Button
                className="w-full rounded-xl"
                onClick={handleStart}
                disabled={actionLoading || otp.length < 4}
              >
                {actionLoading ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                Start Ride
              </Button>
            </div>
          )}

          {/* IN_PROGRESS → Complete */}
          {ride.status === "IN_PROGRESS" && (
            <Button
              className="w-full rounded-xl"
              onClick={handleComplete}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Complete Ride
            </Button>
          )}

          {/* COMPLETED */}
          {ride.status === "COMPLETED" && (
            <div className="rounded-xl bg-green-50 py-3 text-center text-sm font-medium text-green-600">
              Ride completed ✓
            </div>
          )}

          {/* Cancel — only when ACCEPTED or ARRIVING */}
          {isCancellable && (
            <Button
              variant="outline"
              className="w-full rounded-xl border-red-200 text-red-500 hover:bg-red-50"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              Cancel Ride
            </Button>
          )}
        </div>
      </div>
    </CaptainCard>
  );
}
