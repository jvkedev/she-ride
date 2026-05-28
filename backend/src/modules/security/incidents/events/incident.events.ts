// All incident event names in one place
// Easy to swap EventEmitter → BullMQ/Kafka later without touching handlers

export const INCIDENT_EVENTS = {
  CREATED: 'incident.created',
  ASSIGNED: 'incident.assigned',
  STATUS_CHANGED: 'incident.status_changed',
  SLA_BREACHED: 'incident.sla_breached',
  ESCALATED: 'incident.escalated',
  NOTE_ADDED: 'incident.note_added',
} as const;

export interface IncidentCreatedEvent {
  incidentId: string;
  incidentNumber: string;
  severity: string;
  priority: string;
  reportedBy: string;
  reporterRole: string;
}

export interface IncidentAssignedEvent {
  incidentId: string;
  assignedTo: string;
  assignedBy: string;
}

export interface IncidentStatusChangedEvent {
  incidentId: string;
  from: string;
  to: string;
  changedBy: string;
}

export interface IncidentSlaBreachedEvent {
  incidentId: string;
  incidentNumber: string;
  priority: string;
  severity: string;
  assignedTo: string | null;
}
