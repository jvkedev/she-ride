import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../prisma/prisma.service';
import { INCIDENT_EVENTS } from './incident.events';
import type {
  IncidentCreatedEvent,
  IncidentSlaBreachedEvent,
} from './incident.events';
@Injectable()
export class IncidentListener {
  private readonly logger = new Logger(IncidentListener.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── On creation: schedule auto-escalation for P1/P2 ─────────────────────

  @OnEvent(INCIDENT_EVENTS.CREATED)
  async handleIncidentCreated(event: IncidentCreatedEvent) {
    this.logger.log(
      `Incident created: ${event.incidentNumber} | Priority: ${event.priority} | Severity: ${event.severity}`,
    );

    // For P1 (CRITICAL): if not assigned in 2 min, auto-escalate
    // For P2 (HIGH): if not assigned in 10 min, auto-escalate
    const escalationDelays: Record<string, number> = {
      P1: 2 * 60 * 1000,
      P2: 10 * 60 * 1000,
    };

    const delay = escalationDelays[event.priority];
    if (!delay) return; // P3/P4 don't auto-escalate

    setTimeout(async () => {
      await this.checkAndEscalate(event.incidentId, event.incidentNumber);
    }, delay);
  }

  // ── On SLA breach: log + notify ──────────────────────────────────────────

  @OnEvent(INCIDENT_EVENTS.SLA_BREACHED)
  async handleSlaBreached(event: IncidentSlaBreachedEvent) {
    this.logger.warn(
      `SLA BREACHED: ${event.incidentNumber} | Priority: ${event.priority} | Assigned: ${event.assignedTo ?? 'UNASSIGNED'}`,
    );

    // TODO: plug in your notification service here
    // e.g. this.notificationService.notifySecurityLead(event)
    // e.g. this.smsService.send(onCallNumber, `SLA breached: ${event.incidentNumber}`)
  }

  // ── Internal: check if still unassigned and escalate ────────────────────

  private async checkAndEscalate(incidentId: string, incidentNumber: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) return;
    if (incident.assignedTo) return; // already assigned — no action
    if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(incident.status)) return;

    this.logger.warn(
      `AUTO-ESCALATING ${incidentNumber} — unassigned after deadline`,
    );

    // Find the first available SECURITY user to auto-assign
    const securityUser = await this.prisma.user.findFirst({
      where: { role: 'SECURITY', accountStatus: 'ACTIVE' },
    });

    if (!securityUser) {
      this.logger.error(
        `No SECURITY users available to auto-assign ${incidentNumber}`,
      );
      return;
    }

    await this.prisma.incident.update({
      where: { id: incidentId },
      data: {
        assignedTo: securityUser.id,
        assignedAt: new Date(),
        firstResponseAt: new Date(),
        status: 'INVESTIGATING',
      },
    });

    // Audit the auto-escalation
    await this.prisma.auditLog.create({
      data: {
        performedBy: 'SYSTEM',
        action: 'INCIDENT_ASSIGNED',
        incidentId,
        metadata: {
          reason: 'auto_escalation',
          assignedTo: securityUser.id,
        },
        channel: 'system',
      },
    });

    this.logger.log(
      `${incidentNumber} auto-assigned to ${securityUser.id} (${securityUser.fullName ?? 'unknown'})`,
    );
  }
}
