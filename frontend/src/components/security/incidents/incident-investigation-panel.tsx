"use client";

import { useState } from "react";
import { toast } from "sonner";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import PriorityBadge from "@/components/shared/security/priority-badge";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import IncidentTimeline from "@/components/shared/security/incident-timeline";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/shared/dashboard/loading-skeleton";
import {
  useIncident,
  useIncidentTimeline,
  useAddIncidentNote,
  useUpdateIncidentStatus,
} from "@/hooks/security/use-incidents";
import type { DashboardStatus } from "@/components/shared/dashboard/status-badge";
import {
  MapPin,
  User,
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

type Props = {
  incidentId: string;
};

export default function IncidentInvestigationPanel({ incidentId }: Props) {
  const [note, setNote] = useState("");

  const { data: incident, isLoading, error } = useIncident(incidentId);
  const { data: timeline = [] } = useIncidentTimeline(incidentId);
  const addNote = useAddIncidentNote();
  const updateStatus = useUpdateIncidentStatus();

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        Failed to load incident details.
      </div>
    );
  }

  const handleSaveNote = async () => {
    if (!note.trim()) return;
    try {
      await addNote.mutateAsync({
        id: incidentId,
        content: note.trim(),
        isInternal: true,
      });
      setNote("");
      toast.success("Note saved");
    } catch {
      toast.error("Failed to save note");
    }
  };

  const handleStatusChange = async (
    status: "INVESTIGATING" | "RESOLVED" | "CLOSED",
  ) => {
    try {
      await updateStatus.mutateAsync({
        id: incidentId,
        status,
        // backend requires note when resolving or closing
        ...(status === "RESOLVED" && { note: "Resolved by security ops" }),
        ...(status === "CLOSED" && { note: "Closed by security ops" }),
      });
      toast.success(`Incident marked as ${status.toLowerCase()}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update status");
    }
  };

  // map timeline items from backend to component format
  const timelineEvents = timeline.map((item: any) => ({
    id: item.data.id,
    title:
      item.type === "audit"
        ? item.data.action.replace(/_/g, " ").toLowerCase()
        : "Note added",
    time: new Date(item.timestamp).toLocaleString(),
    description:
      item.type === "note"
        ? item.data.content
        : item.data.metadata
          ? JSON.stringify(item.data.metadata)
          : undefined,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* ── Left: Incident details ── */}
      <SurfaceCard>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-neutral-900">
            {incident.incidentNumber}
          </h2>
          <PriorityBadge priority={incident.priority} />
          <StatusBadge status={incident.status as DashboardStatus} />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-neutral-500">Type</dt>
            <dd className="font-medium text-neutral-900">
              {incident.incidentType.replace(/_/g, " ")}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Severity</dt>
            <dd>
              <Badge variant="outline" className="text-xs">
                {incident.severity}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-neutral-500">
              <User className="h-3 w-3" /> Reporter
            </dt>
            <dd className="font-medium text-neutral-900">
              {incident.user?.fullName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-neutral-500">
              <Phone className="h-3 w-3" /> Phone
            </dt>
            <dd className="font-medium text-neutral-900">
              {incident.user?.phoneNumber ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Assigned to</dt>
            <dd className="font-medium text-neutral-900">
              {incident.assignedUser?.fullName ?? "Unassigned"}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-neutral-500">
              <Clock className="h-3 w-3" /> Reported
            </dt>
            <dd className="font-medium text-neutral-900">
              {new Date(incident.createdAt).toLocaleString()}
            </dd>
          </div>
          {incident.address && (
            <div className="col-span-2">
              <dt className="flex items-center gap-1 text-neutral-500">
                <MapPin className="h-3 w-3" /> Location
              </dt>
              <dd className="font-medium text-neutral-900">
                {incident.address}
              </dd>
            </div>
          )}
          {incident.slaDeadline && (
            <div className="col-span-2">
              <dt className="flex items-center gap-1 text-neutral-500">
                <AlertTriangle className="h-3 w-3" /> SLA Deadline
              </dt>
              <dd
                className={`font-medium ${
                  new Date(incident.slaDeadline) < new Date()
                    ? "text-red-600"
                    : "text-neutral-900"
                }`}
              >
                {new Date(incident.slaDeadline).toLocaleString()}
                {new Date(incident.slaDeadline) < new Date() && (
                  <span className="ml-2 text-xs text-red-500">BREACHED</span>
                )}
              </dd>
            </div>
          )}
        </dl>

        <SurfaceCard padding="sm" className="mt-4 bg-neutral-50">
          <p className="text-xs font-medium text-neutral-500">Description</p>
          <p className="mt-2 text-sm text-neutral-600">
            {incident.description}
          </p>
        </SurfaceCard>

        {/* ── Action buttons ── */}
        {incident.status === "OPEN" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg"
              onClick={() => handleStatusChange("INVESTIGATING")}
              disabled={updateStatus.isPending}
            >
              Start Investigation
            </Button>
          </div>
        )}
        {incident.status === "INVESTIGATING" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleStatusChange("RESOLVED")}
              disabled={updateStatus.isPending}
            >
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
              Mark Resolved
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg text-red-600 hover:bg-red-50"
              onClick={() => handleStatusChange("CLOSED")}
              disabled={updateStatus.isPending}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Close
            </Button>
          </div>
        )}
      </SurfaceCard>

      {/* ── Right: Timeline + Notes ── */}
      <div className="space-y-4">
        <SurfaceCard>
          <h3 className="text-sm font-semibold text-neutral-900">
            Resolution timeline
          </h3>
          <div className="mt-4">
            {timelineEvents.length > 0 ? (
              <IncidentTimeline events={timelineEvents} />
            ) : (
              <p className="text-sm text-neutral-400">
                No timeline events yet.
              </p>
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <h3 className="text-sm font-semibold text-neutral-900">
            Internal notes
          </h3>
          <Textarea
            className="mt-3 min-h-30 rounded-lg"
            placeholder="Investigation notes (internal only)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            className="mt-3 rounded-lg"
            onClick={handleSaveNote}
            disabled={addNote.isPending || !note.trim()}
          >
            {addNote.isPending ? "Saving..." : "Save note"}
          </Button>
        </SurfaceCard>
      </div>
    </div>
  );
}
