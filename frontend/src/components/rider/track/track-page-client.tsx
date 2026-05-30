"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BookingLoading from "@/components/rider/booking/booking-loading";
import {
  getRiderActiveRide,
  type RiderActiveRide,
} from "@/services/rides/rides.service";
import { connectSocket, joinRideRoom } from "@/services/socket/socket.service";

const TrackRideLayout = dynamic(
  () => import("@/components/rider/track/track-ride-layout"),
  {
    loading: () => <BookingLoading />,
    ssr: false,
  },
);

export default function TrackPageClient() {
  const router = useRouter();
  const [ride, setRide] = useState<RiderActiveRide | null>(null);
  const [loading, setLoading] = useState(true);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);

  const refreshRide = useCallback(async () => {
    const active = await getRiderActiveRide();
    if (!active) {
      router.replace("/rider");
      return null;
    }
    setRide(active);
    return active;
  }, [router]);

  useEffect(() => {
    refreshRide()
      .catch(() => router.replace("/rider"))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      void refreshRide();
    }, 12000);
    return () => clearInterval(interval);
  }, [refreshRide, router]);

  useEffect(() => {
    if (!ride?.rideId) return;

    const token = localStorage.getItem("accessToken") ?? "";
    let userId: string | null = null;
    try {
      userId = JSON.parse(atob(token.split(".")[1])).sub;
    } catch {
      return;
    }
    if (!userId) return;

    const socket = connectSocket(userId);
    joinRideRoom(ride.rideId);

    const onStatus = (data: { status: string }) => {
      setRide((prev) =>
        prev ? { ...prev, status: data.status } : prev,
      );
      if (data.status === "COMPLETED" || data.status === "CANCELED") {
        setTimeout(() => router.replace("/rider/history"), 2000);
      }
    };

    const onCaptainLocation = (data: {
      lat: number;
      lng: number;
      etaMinutes?: number;
    }) => {
      if (data.etaMinutes != null) setEtaMinutes(data.etaMinutes);
      setRide((prev) => {
        if (!prev?.captain) return prev;
        return {
          ...prev,
          captain: {
            ...prev.captain,
            lat: data.lat,
            lng: data.lng,
          },
        };
      });
    };

    const onAccepted = (data: {
      status: string;
      captain?: RiderActiveRide["captain"];
    }) => {
      setRide((prev) =>
        prev
          ? {
              ...prev,
              status: data.status,
              captain: data.captain ?? prev.captain,
            }
          : prev,
      );
    };

    socket.on("ride:status", onStatus);
    socket.on("captain:location", onCaptainLocation);
    socket.on("ride:accepted", onAccepted);

    return () => {
      socket.off("ride:status", onStatus);
      socket.off("captain:location", onCaptainLocation);
      socket.off("ride:accepted", onAccepted);
    };
  }, [ride?.rideId, router]);

  if (loading || !ride) {
    return <BookingLoading />;
  }

  return (
    <div className="h-full min-h-0 flex-1">
      <TrackRideLayout ride={ride} etaMinutes={etaMinutes} />
    </div>
  );
}
