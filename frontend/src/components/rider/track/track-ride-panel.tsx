import { Car, MapPin, Phone, Star } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function TrackRidePanel() {
  return (
    <>
      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Active ride
            </p>
            <h2 className="mt-1 text-lg font-semibold text-neutral-900">
              She Go · On the way
            </h2>
            <p className="mt-1 text-sm text-neutral-500">OTP · 4829</p>
          </div>
          <span className="rounded-full bg-[#e8f5e9] px-3 py-1 text-xs font-medium text-[#2e7d32]">
            4 min away
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex gap-3 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-400" />
            <div>
              <p className="font-medium text-neutral-900">ITL Twin Tower</p>
              <p className="text-neutral-500">Pickup</p>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-900" />
            <div>
              <p className="font-medium text-neutral-900">Century Public School</p>
              <p className="text-neutral-500">Drop-off</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-neutral-100">
            <Car className="size-5 text-neutral-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-neutral-900">Priya Sharma</p>
            <p className="flex items-center gap-1 text-sm text-neutral-500">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              4.9 · DL 01 AB 1234
            </p>
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-lg border-neutral-300"
            aria-label="Call driver"
          >
            <Phone className="size-4" />
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Trip status
        </p>
        <ol className="mt-4 space-y-4">
          {[
            { label: "Driver assigned", done: true },
            { label: "On the way to pickup", done: true },
            { label: "Arriving at pickup", done: false },
            { label: "Trip started", done: false },
          ].map((step, i) => (
            <li key={step.label} className="flex items-center gap-3 text-sm">
              <span
                className={
                  step.done
                    ? "flex size-6 items-center justify-center rounded-full bg-neutral-900 text-xs text-white"
                    : "flex size-6 items-center justify-center rounded-full border-2 border-neutral-200 text-xs text-neutral-400"
                }
              >
                {i + 1}
              </span>
              <span
                className={
                  step.done ? "font-medium text-neutral-900" : "text-neutral-500"
                }
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <Button className="h-11 w-full rounded-lg bg-primary font-semibold hover:bg-primary/90">
        Share trip status
      </Button>
    </>
  );
}
