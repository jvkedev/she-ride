"use client";
import { useEffect, useState } from "react";
import RequestCard from "@/components/captain/requests/request-card";
import CaptainEmptyState from "@/components/captain/shared/captain-empty-state";
import { Zap } from "lucide-react";
import {
  getSearchingRides,
  acceptRide,
  CaptainRideRequest,
} from "@/services/captain/captain-rides.service";
import { useCaptainStore } from "@/store/captain.store";

type RequestListProps = {
  showTimer?: boolean;
  compact?: boolean;
  onRideAccepted?: (rideId: string) => void;
};

export default function RequestList({
  showTimer = false,
  compact = false,
  onRideAccepted,
}: RequestListProps) {
  const [requests, setRequests] = useState<CaptainRideRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchRides() {
    try {
      const data = await getSearchingRides();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch rides:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRides();
    const interval = setInterval(fetchRides, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleAccept(rideId: string) {
    console.log("handleAccept called with:", rideId);
    try {
      const result = await acceptRide(rideId);
      console.log("acceptRide result:", result);
      setRequests((prev) => prev.filter((r) => r.rideId !== rideId));

      // Set directly in Zustand store
      const store = useCaptainStore.getState();
      console.log("Store before:", store.activeRideId);
      store.setActiveRideId(rideId);
      console.log("Store after:", useCaptainStore.getState().activeRideId);

      onRideAccepted?.(rideId);
    } catch (err: any) {
      console.error("Accept failed:", err?.response?.data);
    }
  }

  function handleDecline(rideId: string) {
    setRequests((prev) => prev.filter((r) => r.rideId !== rideId));
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl bg-neutral-100"
          />
        ))}
      </div>
    );
  }

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
          key={request.rideId}
          request={{
            id: request.rideId,
            passengerName: request.passengerName,
            passengerRating: request.passengerRating,
            fare: request.fare,
            distance: `${request.distanceInKm} km`,
            vehicleType: request.vehicleType,
            paymentMethod: request.paymentMethod,
            eta: "—",
            pickup: request.pickup,
            dropoff: request.dropoff,
          }}
          showTimer={showTimer}
          onAccept={() => handleAccept(request.rideId)}
          onDecline={() => handleDecline(request.rideId)}
        />
      ))}
    </div>
  );
}
