"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useIncident,
  useIncidentTimeline,
  useAddIncidentNote,
  useUpdateIncidentStatus,
  useAssignIncident,
  useAssignees,
} from "@/hooks/security/use-incidents";
import type { DashboardStatus } from "@/components/shared/dashboard/status-badge";
import type { IncidentStatus } from "@/lib/security/types";
import {
  formatIncidentTimeline,
  getMapsHref,
  getReporterProfileHref,
} from "@/lib/security/incident-timeline";
import {
  MapPin,
  User,
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Car,
  Shield,
  Ban,
} from "lucide-react";

type Props = {
  incidentId: string;
};

type StatusAction = {
  status: IncidentStatus;
  label: string;
  variant?: "default" | "outline" | "destructive";
  icon?: React.ReactNode;
  className?: string;
};

export default function IncidentInvestigationPanel({ incidentId }: Props) {
  const [note, setNote] = useState("");
  const [statusDialog, setStatusDialog] = useState<StatusAction | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const { data: incident, isLoading, error } = useIncident(incidentId);
  const { data: timeline = [] } = useIncidentTimeline(incidentId);
  const { data: assignees = [], isLoading: assigneesLoading } = useAssignees();
  const addNote = useAddIncidentNote();
  const updateStatus = useUpdateIncidentStatus();
  const assignIncident = useAssignIncident();

  const timelineEvents = useMemo(
    () => formatIncidentTimeline(timeline),
    [timeline],
  );

  const internalNotes = useMemo(
    () =>
      (incident?.notes ?? [])
        .filter((n) => n.isInternal)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [incident?.notes],
  );

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

  const mapsHref = getMapsHref(incident.latitude, incident.longitude);
  const reporterHref = getReporterProfileHref(incident.user);
  const isTerminal =
    incident.status === "CLOSED" || incident.status === "REJECTED";

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

  const handleAssign = async (assigneeId: string) => {
    if (!assigneeId || assigneeId === incident.assignedTo) return;
    try {
      await assignIncident.mutateAsync({ id: incidentId, assigneeId });
      toast.success("Incident assigned");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to assign incident";
      toast.error(message);
    }
  };

  const openStatusDialog = (action: StatusAction) => {
    setResolutionNote("");
    setStatusDialog(action);
  };

  const confirmStatusChange = async () => {
    if (!statusDialog) return;
    const trimmed = resolutionNote.trim();
    const requiresNote = ["RESOLVED", "CLOSED", "REJECTED"].includes(
      statusDialog.status,
    );
    if (requiresNote && !trimmed) {
      toast.error("A note is required for this action");
      return;
    }

    try {
      await updateStatus.mutateAsync({
        id: incidentId,
        status: statusDialog.status,
        ...(requiresNote && { note: trimmed }),
      });
      toast.success(`Incident marked as ${statusDialog.status.toLowerCase()}`);
      setStatusDialog(null);
      setResolutionNote("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    }
  };

  const statusActions: StatusAction[] = (() => {
    switch (incident.status) {
      case "OPEN":
        return [
          {
            status: "INVESTIGATING",
            label: "Start investigation",
            variant: "outline",
          },
          {
            status: "CLOSED",
            label: "Close",
            variant: "outline",
            icon: <XCircle className="mr-1.5 h-3.5 w-3.5" />,
            className: "text-red-600 hover:bg-red-50",
          },
          {
            status: "REJECTED",
            label: "Reject",
            variant: "outline",
            icon: <Ban className="mr-1.5 h-3.5 w-3.5" />,
            className: "text-amber-700 hover:bg-amber-50",
          },
        ];
      case "INVESTIGATING":
        return [
          {
            status: "RESOLVED",
            label: "Mark resolved",
            icon: <CheckCircle className="mr-1.5 h-3.5 w-3.5" />,
            className: "bg-emerald-600 hover:bg-emerald-700",
          },
          {
            status: "CLOSED",
            label: "Close",
            variant: "outline",
            icon: <XCircle className="mr-1.5 h-3.5 w-3.5" />,
            className: "text-red-600 hover:bg-red-50",
          },
        ];
      case "RESOLVED":
        return [
          {
            status: "CLOSED",
            label: "Close incident",
            variant: "outline",
            icon: <XCircle className="mr-1.5 h-3.5 w-3.5" />,
          },
        ];
      default:
        return [];
    }
  })();

  const requiresNoteInDialog =
    statusDialog != null &&
    ["RESOLVED", "CLOSED", "REJECTED"].includes(statusDialog.status);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Left: Incident details ── */}
        <div className="space-y-4">
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
                  <Badge
                    variant="outline"
                    className={
                      incident.severity === "HIGH" ||
                      incident.severity === "CRITICAL"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "text-xs"
                    }
                  >
                    {incident.severity}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-neutral-500">
                  <User className="h-3 w-3" /> Reporter
                </dt>
                <dd className="font-medium text-neutral-900">
                  {reporterHref ? (
                    <Link
                      href={reporterHref}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {incident.user.fullName}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    (incident.user.fullName ?? "—")
                  )}
                  <span className="ml-1.5 text-xs font-normal text-neutral-400">
                    ({incident.user.role.toLowerCase()})
                  </span>
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-neutral-500">
                  <Phone className="h-3 w-3" /> Phone
                </dt>
                <dd className="font-medium text-neutral-900">
                  {incident.user.phoneNumber ? (
                    <a
                      href={`tel:${incident.user.phoneNumber}`}
                      className="text-primary hover:underline"
                    >
                      {incident.user.phoneNumber}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="mb-1.5 flex items-center gap-1 text-neutral-500">
                  <Shield className="h-3 w-3" /> Assigned to
                </dt>
                <dd>
                  {isTerminal ? (
                    <span className="font-medium text-neutral-900">
                      {incident.assignedUser?.fullName ?? "Unassigned"}
                    </span>
                  ) : (
                    <Select
                      value={incident.assignedTo ?? "unassigned"}
                      onValueChange={(value) => {
                        if (value !== "unassigned") handleAssign(value);
                      }}
                      disabled={
                        assignIncident.isPending || assigneesLoading
                      }
                    >
                      <SelectTrigger className="h-9 w-full max-w-xs rounded-lg">
                        <SelectValue placeholder="Assign investigator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {assignees.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.fullName} ({member.role.toLowerCase()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
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
              {incident.resolvedAt && (
                <div>
                  <dt className="text-neutral-500">Resolved</dt>
                  <dd className="font-medium text-neutral-900">
                    {new Date(incident.resolvedAt).toLocaleString()}
                  </dd>
                </div>
              )}
              {incident.address && (
                <div className="col-span-2">
                  <dt className="flex items-center gap-1 text-neutral-500">
                    <MapPin className="h-3 w-3" /> Location
                  </dt>
                  <dd className="font-medium text-neutral-900">
                    {incident.address}
                    {mapsHref ? (
                      <a
                        href={mapsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
                      >
                        View on map
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </dd>
                </div>
              )}
              {incident.slaDeadline && (
                <div className="col-span-2">
                  <dt className="flex items-center gap-1 text-neutral-500">
                    <AlertTriangle className="h-3 w-3" /> SLA deadline
                  </dt>
                  <dd
                    className={`font-medium ${
                      new Date(incident.slaDeadline) < new Date() &&
                      incident.status !== "CLOSED" &&
                      incident.status !== "RESOLVED"
                        ? "text-red-600"
                        : "text-neutral-900"
                    }`}
                  >
                    {new Date(incident.slaDeadline).toLocaleString()}
                    {new Date(incident.slaDeadline) < new Date() &&
                      !["CLOSED", "RESOLVED"].includes(incident.status) && (
                        <span className="ml-2 text-xs font-semibold text-red-500">
                          BREACHED
                        </span>
                      )}
                  </dd>
                </div>
              )}
            </dl>

            <SurfaceCard padding="sm" className="mt-4 bg-neutral-50">
              <p className="text-xs font-medium text-neutral-500">
                Description
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                {incident.description}
              </p>
            </SurfaceCard>

            {!isTerminal && statusActions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {statusActions.map((action) => (
                  <Button
                    key={action.status}
                    size="sm"
                    variant={action.variant ?? "default"}
                    className={`rounded-lg ${action.className ?? ""}`}
                    onClick={() => {
                      if (
                        ["RESOLVED", "CLOSED", "REJECTED"].includes(
                          action.status,
                        )
                      ) {
                        openStatusDialog(action);
                      } else {
                        updateStatus
                          .mutateAsync({
                            id: incidentId,
                            status: action.status,
                          })
                          .then(() =>
                            toast.success(
                              `Incident marked as ${action.status.toLowerCase()}`,
                            ),
                          )
                          .catch((err: unknown) =>
                            toast.error(
                              err instanceof Error
                                ? err.message
                                : "Failed to update status",
                            ),
                          );
                      }
                    }}
                    disabled={updateStatus.isPending}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </SurfaceCard>

          {/* Connected records */}
          <SurfaceCard>
            <h3 className="text-sm font-semibold text-neutral-900">
              Connected records
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {incident.ride ? (
                <li className="flex items-start gap-2 rounded-lg border border-neutral-100 bg-neutral-50/80 p-3">
                  <Car className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-900">Linked ride</p>
                    <p className="mt-0.5 text-neutral-600">
                      {incident.ride.pickupAddress} →{" "}
                      {incident.ride.dropAddress}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Status: {incident.ride.status.replace(/_/g, " ")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link
                        href="/security/surveillance"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Live surveillance
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      {incident.ride.captain && (
                        <Link
                          href={`/security/verification/drivers/${incident.ride.captain.id}`}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Captain: {incident.ride.captain.user.fullName}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                      {incident.ride.rider && (
                        <Link
                          href="/security/accounts"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Rider: {incident.ride.rider.user.fullName}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              ) : (
                <li className="text-neutral-400">No ride linked to incident.</li>
              )}
              <li className="flex items-start gap-2 rounded-lg border border-neutral-100 bg-neutral-50/80 p-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900">
                    Related dashboards
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <Link
                      href="/security/sos"
                      className="text-xs text-primary hover:underline"
                    >
                      SOS center
                    </Link>
                    <Link
                      href="/security/fraud"
                      className="text-xs text-primary hover:underline"
                    >
                      Fraud detection
                    </Link>
                    <Link
                      href="/security/verification/drivers"
                      className="text-xs text-primary hover:underline"
                    >
                      Driver verification
                    </Link>
                    <Link
                      href="/security/accounts"
                      className="text-xs text-primary hover:underline"
                    >
                      Account security
                    </Link>
                  </div>
                </div>
              </li>
            </ul>
          </SurfaceCard>
        </div>

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

            {internalNotes.length > 0 && (
              <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
                {internalNotes.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-lg border border-neutral-100 bg-neutral-50/80 p-3 text-sm"
                  >
                    <p className="text-neutral-700">{entry.content}</p>
                    <p className="mt-1.5 text-xs text-neutral-400">
                      {entry.author.fullName} ·{" "}
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {!isTerminal && (
              <>
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
              </>
            )}
          </SurfaceCard>
        </div>
      </div>

      <Dialog
        open={statusDialog != null}
        onOpenChange={(open) => !open && setStatusDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{statusDialog?.label}</DialogTitle>
            <DialogDescription>
              {requiresNoteInDialog
                ? "Add a resolution note. This will be visible to the reporter."
                : "Confirm this status change."}
            </DialogDescription>
          </DialogHeader>
          {requiresNoteInDialog && (
            <Textarea
              className="min-h-24 rounded-lg"
              placeholder="Describe the outcome of this investigation..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
            />
          )}
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => setStatusDialog(null)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-lg"
              onClick={confirmStatusChange}
              disabled={
                updateStatus.isPending ||
                (requiresNoteInDialog && !resolutionNote.trim())
              }
            >
              {updateStatus.isPending ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
