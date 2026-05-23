import IncidentTimeline from "@/components/shared/security/incident-timeline";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import PriorityBadge from "@/components/shared/security/priority-badge";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { SecurityIncident } from "@/lib/security/types";

const timeline = [
  { id: "1", title: "Report filed", time: "Today, 1:00 PM", description: "Rider submitted in-app report" },
  { id: "2", title: "Assigned to investigator", time: "Today, 1:15 PM" },
  { id: "3", title: "Evidence reviewed", time: "Today, 2:00 PM", description: "Trip recording + chat logs" },
];

type IncidentInvestigationPanelProps = {
  incident: SecurityIncident;
};

export default function IncidentInvestigationPanel({
  incident,
}: IncidentInvestigationPanelProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SurfaceCard>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold dark:text-white">{incident.title}</h2>
          <PriorityBadge priority={incident.priority} />
          <StatusBadge status={incident.status} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-neutral-500">Category</dt>
            <dd className="font-medium dark:text-neutral-200">{incident.category}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Reporter</dt>
            <dd className="font-medium dark:text-neutral-200">{incident.reporter}</dd>
          </div>
          <div>
            <dt className="text-neutral-500">Assigned to</dt>
            <dd className="font-medium dark:text-neutral-200">{incident.assignedTo}</dd>
          </div>
        </dl>
        <SurfaceCard padding="sm" className="mt-4 bg-neutral-50 dark:bg-neutral-800">
          <p className="text-xs font-medium text-neutral-500">Evidence preview</p>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Trip audio, GPS trace, and in-app messages attached (mock).
          </p>
        </SurfaceCard>
      </SurfaceCard>
      <div className="space-y-4">
        <SurfaceCard>
          <h3 className="text-sm font-semibold dark:text-white">Resolution timeline</h3>
          <div className="mt-4">
            <IncidentTimeline events={timeline} />
          </div>
        </SurfaceCard>
        <SurfaceCard>
          <h3 className="text-sm font-semibold dark:text-white">Internal notes</h3>
          <Textarea
            className="mt-3 min-h-[120px] rounded-lg"
            placeholder="Investigation notes (internal only)..."
          />
          <Button className="mt-3 rounded-lg">Save notes</Button>
        </SurfaceCard>
      </div>
    </div>
  );
}
