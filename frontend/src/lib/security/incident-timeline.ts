import type { TimelineEvent } from "@/components/shared/security/incident-timeline";

export type RawTimelineItem = {
  type: "audit" | "note";
  timestamp: string;
  data: {
    id: string;
    action?: string;
    newData?: Record<string, unknown>;
    previousData?: Record<string, unknown>;
    content?: string;
    isInternal?: boolean;
    author?: { fullName?: string };
  };
};

const AUDIT_LABELS: Record<string, string> = {
  INCIDENT_CREATED: "Incident created",
  INCIDENT_ASSIGNED: "Incident assigned",
  INCIDENT_STATUS_CHANGED: "Status updated",
  INCIDENT_RESOLVED: "Incident resolved",
  INCIDENT_NOTE_ADDED: "Note added",
};

export function formatIncidentTimeline(items: RawTimelineItem[]): TimelineEvent[] {
  let seenCreated = false;
  const events: TimelineEvent[] = [];

  for (const item of items) {
    if (item.type === "audit") {
      const action = item.data.action ?? "";

      // Notes are shown as dedicated timeline entries with full content.
      if (action === "INCIDENT_NOTE_ADDED") continue;

      if (action === "INCIDENT_CREATED") {
        if (seenCreated) continue;
        seenCreated = true;
      }

      const newData = item.data.newData;
      const prevData = item.data.previousData;
      let description: string | undefined;

      if (action === "INCIDENT_ASSIGNED" && newData) {
        const assigneeName = newData.assigneeName as string | undefined;
        const parts: string[] = [];
        if (assigneeName) parts.push(`Assigned to ${assigneeName}`);
        if (newData.status && newData.status !== prevData?.status) {
          parts.push(`Status → ${String(newData.status).toLowerCase()}`);
        }
        description = parts.length > 0 ? parts.join(" · ") : undefined;
      } else if (action === "INCIDENT_STATUS_CHANGED" && newData?.status) {
        description = `Status changed to ${String(newData.status).toLowerCase()}`;
      } else if (action === "INCIDENT_CREATED" && newData?.incidentNumber) {
        description = `Reference ${String(newData.incidentNumber)}`;
      } else if (action === "INCIDENT_RESOLVED") {
        description = "Investigation completed";
      }

      events.push({
        id: item.data.id,
        title:
          AUDIT_LABELS[action] ??
          action.replace(/_/g, " ").toLowerCase(),
        time: new Date(item.timestamp).toLocaleString(),
        description,
      });
    } else {
      const author = item.data.author?.fullName;
      const prefix = author ? `${author}: ` : "";
      events.push({
        id: item.data.id,
        title: item.data.isInternal ? "Internal note added" : "Resolution note",
        time: new Date(item.timestamp).toLocaleString(),
        description: `${prefix}${item.data.content ?? ""}`,
      });
    }
  }

  return events;
}

export function getReporterProfileHref(user: {
  role: string;
  captain?: { id: string } | null;
  rider?: { id: string } | null;
}): string | null {
  if (user.role === "CAPTAIN" && user.captain?.id) {
    return `/security/verification/drivers/${user.captain.id}`;
  }
  if (user.role === "RIDER") {
    return "/security/accounts";
  }
  if (user.role === "SECURITY") {
    return "/security/profile";
  }
  return null;
}

export function getMapsHref(latitude?: number, longitude?: number): string | null {
  if (latitude == null || longitude == null) return null;
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
