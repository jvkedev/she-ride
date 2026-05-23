"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import type { AdminRide } from "@/lib/admin/types";

type RideDetailDrawerProps = {
  ride: AdminRide | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const timeline = [
  { step: "Ride requested", time: "2:35 PM" },
  { step: "Driver assigned", time: "2:36 PM" },
  { step: "Captain arrived", time: "2:42 PM" },
  { step: "Trip started", time: "2:45 PM" },
];

export default function RideDetailDrawer({
  ride,
  open,
  onOpenChange,
}: RideDetailDrawerProps) {
  if (!ride) return null;

  const fareBreakdown = [
    { label: "Base fare", amount: 49 },
    { label: "Distance", amount: 72 },
    { label: "Time", amount: 25 },
    { label: "Platform fee", amount: -10 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ride {ride.id}
            <StatusBadge status={ride.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <SurfaceCard padding="sm">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-neutral-500">Rider</dt>
                <dd className="font-medium">{ride.riderName}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Driver</dt>
                <dd className="font-medium">{ride.driverName}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-neutral-500">Pickup</dt>
                <dd className="font-medium">{ride.pickup}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-neutral-500">Dropoff</dt>
                <dd className="font-medium">{ride.dropoff}</dd>
              </div>
            </dl>
          </SurfaceCard>

          <SurfaceCard padding="sm">
            <h3 className="text-sm font-semibold text-neutral-900">Fare breakdown</h3>
            <ul className="mt-3 space-y-2">
              {fareBreakdown.map((row) => (
                <li key={row.label} className="flex justify-between text-sm">
                  <span className="text-neutral-600">{row.label}</span>
                  <span className={row.amount < 0 ? "text-red-600" : "font-medium"}>
                    {row.amount < 0 ? "-" : ""}₹{Math.abs(row.amount)}
                  </span>
                </li>
              ))}
              <li className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>₹{ride.fare}</span>
              </li>
            </ul>
          </SurfaceCard>

          <SurfaceCard padding="sm">
            <h3 className="text-sm font-semibold text-neutral-900">Timeline</h3>
            <ol className="mt-3 space-y-2">
              {timeline.map((item) => (
                <li key={item.step} className="flex justify-between text-sm">
                  <span className="text-neutral-700">{item.step}</span>
                  <span className="text-neutral-400">{item.time}</span>
                </li>
              ))}
            </ol>
          </SurfaceCard>
        </div>
      </DialogContent>
    </Dialog>
  );
}
