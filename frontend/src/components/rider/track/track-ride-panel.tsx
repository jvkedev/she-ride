"use client";

import {
  Car,
  Clock,
  IndianRupee,
  MapPin,
  Navigation,
  Phone,
  Share2,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { activeTrackRide } from "@/lib/rider/rider-mock-data";
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

export default function TrackRidePanel() {
  const ride = activeTrackRide;

  return (
    <div className="flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-neutral-900">
            Track your ride
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {ride.vehicle} · {ride.status}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {ride.etaMinutes} min away
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <Clock className="size-3.5" />
            ETA
          </p>
          <p className="mt-0.5 text-lg font-semibold text-neutral-900">
            {ride.etaMinutes} min
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <Navigation className="size-3.5" />
            Distance
          </p>
          <p className="mt-0.5 text-lg font-semibold text-neutral-900">
            {ride.distanceKm} km
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <IndianRupee className="size-3.5" />
            Fare
          </p>
          <p className="mt-0.5 text-lg font-semibold text-neutral-900">₹{ride.fare}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-primary/5 px-3 py-2.5">
          <p className="text-xs text-neutral-500">Trip OTP</p>
          <p className="mt-0.5 text-lg font-bold tracking-widest text-primary">
            {ride.otp}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <TrackCard title="Route">
          <div className="space-y-3">
            <div className="flex gap-2.5 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="font-medium text-neutral-900">{ride.pickup}</p>
                <p className="text-xs text-neutral-500">Pickup</p>
              </div>
            </div>
            <div className="ml-2 border-l-2 border-dashed border-neutral-200 pl-4">
              <div className="flex gap-2.5 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-400" />
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">{ride.dropoff}</p>
                  <p className="text-xs text-neutral-500">Drop-off</p>
                </div>
              </div>
            </div>
          </div>
        </TrackCard>

        <TrackCard title="Your captain">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-neutral-200">
              <Car className="size-5 text-neutral-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-neutral-900">{ride.driver.name}</p>
              <p className="flex items-center gap-1 text-sm text-neutral-500">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {ride.driver.rating} · {ride.driver.plate}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon-sm"
              className="size-10 rounded-lg border-neutral-200"
              aria-label="Call driver"
            >
              <Phone className="size-4" />
            </Button>
          </div>
        </TrackCard>

        <TrackCard title="Trip progress">
          <ol className="space-y-2">
            {ride.timeline.map((step, index) => (
              <li
                key={step.label}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
                  step.done
                    ? "bg-primary/5 font-medium text-neutral-900"
                    : "bg-neutral-50 text-neutral-500",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    step.done
                      ? "bg-primary text-white"
                      : "border border-neutral-200 text-neutral-400",
                  )}
                >
                  {index + 1}
                </span>
                <span className="truncate">{step.label}</span>
              </li>
            ))}
          </ol>
        </TrackCard>
      </div>

      <Button className="mt-5 h-11 w-full gap-2 rounded-lg font-semibold">
        <Share2 className="size-4" />
        Share trip status
      </Button>
    </div>
  );
}
