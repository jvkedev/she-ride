"use client";

import AlertCard from "@/components/shared/security/alert-card";
import IncidentTimeline from "@/components/shared/security/incident-timeline";
import AdminLiveMap from "@/components/shared/maps/admin-live-map";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { Button } from "@/components/ui/button";
import { sosAlerts } from "@/lib/security/mock-data";

const timeline = [
  { id: "t1", title: "SOS triggered by rider", time: "2:40 PM" },
  { id: "t2", title: "Auto-alert to security ops", time: "2:40 PM" },
  { id: "t3", title: "Escalated to L2 response", time: "2:41 PM" },
  { id: "t4", title: "Live tracking engaged", time: "2:42 PM" },
];

export default function SosMonitoringPanel() {
  const active = sosAlerts.filter((a) => a.status !== "resolved");

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,280px)_1fr] lg:p-5">
      <div className="dashboard-panel-scroll space-y-4 overflow-y-auto p-4 lg:p-0">
        <SurfaceCard padding="sm">
          <h2 className="text-sm font-semibold text-neutral-900">Emergency actions</h2>
          <div className="mt-3 grid gap-2">
            <Button variant="destructive" className="h-10 rounded-lg">
              Dispatch emergency team
            </Button>
            <Button variant="outline" className="h-10 rounded-lg">
              Contact local authorities
            </Button>
            <Button variant="outline" className="h-10 rounded-lg">
              Notify trusted contacts
            </Button>
          </div>
        </SurfaceCard>

        {active.map((alert) => (
          <AlertCard
            key={alert.id}
            title={`SOS · ${alert.rideId}`}
            description={`${alert.riderName} · ${alert.driverName} · ${alert.location}`}
            priority={alert.priority}
            time={alert.triggeredAt}
            pulse={alert.priority === "critical"}
            actions={
              <Button size="sm" className="rounded-lg text-xs">
                {alert.escalated ? "L2 Active" : "Escalate"}
              </Button>
            }
          />
        ))}

        <SurfaceCard>
          <h3 className="text-sm font-semibold text-neutral-900">Emergency timeline</h3>
          <div className="mt-4">
            <IncidentTimeline events={timeline} />
          </div>
        </SurfaceCard>
      </div>

      <div className="min-h-[320px] flex-1 p-4 pt-0 lg:p-0">
        <AdminLiveMap
          className="h-full min-h-[400px]"
          overlay={
            <div className="pointer-events-auto rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs font-medium text-neutral-900 shadow-sm backdrop-blur-sm">
              Live SOS tracking · {active.length} active
            </div>
          }
        />
      </div>
    </div>
  );
}
