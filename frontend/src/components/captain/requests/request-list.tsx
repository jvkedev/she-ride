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

import { useCaptainProfile } from "@/hooks/captain/use-captain-profile";
import { useCaptainStore } from "@/store/captain.store";

import {

  connectSocket,

  getSocket,

  joinRideRoom,

} from "@/services/socket/socket.service";



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
  const { data: profile } = useCaptainProfile();



  async function fetchRides() {

    try {

      const data = await getSearchingRides();

      setRequests(data);

    } catch {

      /* keep existing list on transient auth errors after refresh */

    } finally {

      setLoading(false);

    }

  }



  useEffect(() => {

    fetchRides();



    const token = localStorage.getItem("accessToken") ?? "";

    let userId: string | null = null;

    try {

      userId = JSON.parse(atob(token.split(".")[1])).sub;

    } catch {

      userId = null;

    }



    const socket = userId ? connectSocket(userId, { role: "CAPTAIN" }) : null;



    if (userId && socket && profile?.vehicleType) {
      getSocket().emit("register", {
        userId,
        role: "CAPTAIN",
        vehicleType: profile.vehicleType,
      });
    }



    const onNewRide = (ride: {

      rideId: string;

      pickupAddress: string;

      dropAddress: string;

      estimatedFare: number;

      distanceInKm: number;

      vehicleType: string;

      paymentMethod: string;

    }) => {

      setRequests((prev) => {

        if (prev.some((r) => r.rideId === ride.rideId)) return prev;

        return [

          {

            rideId: ride.rideId,

            passengerName: "Rider",

            passengerRating: 5,

            fare: ride.estimatedFare,

            distanceInKm: ride.distanceInKm,

            vehicleType: ride.vehicleType,

            paymentMethod: ride.paymentMethod,

            pickup: ride.pickupAddress,

            dropoff: ride.dropAddress,

          },

          ...prev,

        ];

      });

      setLoading(false);

    };



    const onRideTaken = (data: { rideId?: string; status?: string }) => {

      if (!data.rideId) return;

      setRequests((prev) => prev.filter((r) => r.rideId !== data.rideId));

    };



    socket?.on("ride:new", onNewRide);

    socket?.on("ride:status", onRideTaken);

    socket?.on("ride:accepted", onRideTaken);



    const interval = setInterval(fetchRides, 15000);

    return () => {

      clearInterval(interval);

      socket?.off("ride:new", onNewRide);

      socket?.off("ride:status", onRideTaken);

      socket?.off("ride:accepted", onRideTaken);

    };

  }, [profile?.vehicleType]);



  async function handleAccept(rideId: string) {

    try {

      await acceptRide(rideId);

      setRequests((prev) => prev.filter((r) => r.rideId !== rideId));

      joinRideRoom(rideId);



      const { getActiveRide } = await import(

        "@/services/captain/captain-rides.service"

      );

      try {

        const details = await getActiveRide(rideId);

        useCaptainStore.getState().setActiveRide({

          rideId: details.rideId,

          status: details.status,

          pickupLat: details.pickupLatitude,

          pickupLng: details.pickupLongitude,

          dropLat: details.dropLatitude,

          dropLng: details.dropLongitude,

          vehicleType: details.vehicleType,

          pickupAddress: details.pickupAddress,

          dropAddress: details.dropAddress,

        });

      } catch {

        useCaptainStore.getState().setActiveRideId(rideId);

      }



      onRideAccepted?.(rideId);

    } catch (err: unknown) {

      console.error("Accept failed:", err);

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

          onAccept={() => void handleAccept(request.rideId)}

          onDecline={() => handleDecline(request.rideId)}

        />

      ))}

    </div>

  );

}


