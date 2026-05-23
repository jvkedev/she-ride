"use client";

import PriorityBadge from "@/components/shared/security/priority-badge";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sosAlerts } from "@/lib/security/mock-data";

export default function EmergencyResponsePanel() {
  const critical = sosAlerts.filter((a) => a.priority === "critical");

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <SurfaceCard className="flex min-h-[480px] flex-col">
        <h2 className="text-sm font-semibold text-neutral-900">Internal response channel</h2>
        <div className="dashboard-panel-scroll mt-4 flex-1 space-y-3 rounded-lg border border-neutral-100 p-4">
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-sm font-medium text-red-800">Ops Lead · 3:05 PM</p>
            <p className="mt-1 text-sm text-red-700">
              Escalating SOS-1 to emergency response. Contacting local authorities.
            </p>
          </div>
          <div className="rounded-lg bg-neutral-100 p-3">
            <p className="text-sm font-medium text-neutral-900">Field Team · 3:06 PM</p>
            <p className="mt-1 text-sm text-neutral-600">
              ETA 8 minutes to rider location.
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2 border-t border-neutral-100 pt-4">
          <Textarea placeholder="Internal message..." className="min-h-[80px] rounded-lg" />
          <Button className="shrink-0 self-end rounded-lg">Send</Button>
        </div>
      </SurfaceCard>

      <div className="space-y-4">
        <SurfaceCard>
          <h3 className="text-sm font-semibold text-neutral-900">Priority queue</h3>
          <ul className="mt-3 space-y-2">
            {critical.map((alert) => (
              <li key={alert.id} className="rounded-lg border border-red-200 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">{alert.rideId}</span>
                  <PriorityBadge priority={alert.priority} />
                </div>
                <p className="mt-1 text-sm text-neutral-700">{alert.location}</p>
              </li>
            ))}
          </ul>
        </SurfaceCard>
        <SurfaceCard>
          <h3 className="text-sm font-semibold text-neutral-900">Escalation controls</h3>
          <div className="mt-3 grid gap-2">
            <Button variant="destructive" className="rounded-lg">
              L3 — Executive alert
            </Button>
            <Button variant="outline" className="rounded-lg">
              Assign response lead
            </Button>
            <Button variant="outline" className="rounded-lg">
              Mark incident contained
            </Button>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
