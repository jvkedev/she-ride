import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IncidentService } from '../incident.service';

// ── SOS events (add these to your SOS service when it emits) ─────────────
export const SOS_EVENTS = {
  CREATED: 'sos.created',
  RESOLVED: 'sos.resolved',
} as const;

export interface SosCreatedEvent {
  sosId: string;
  riderId: string;
  rideId?: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface SosResolvedEvent {
  sosId: string;
  riderId: string;
  rideId?: string;
  resolvedBy: string;
  resolutionNote?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

@Injectable()
export class SosIncidentBridgeListener {
  private readonly logger = new Logger(SosIncidentBridgeListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly incidentService: IncidentService,
  ) {}

  // ── On SOS created: immediately create a linked CRITICAL incident ────────

  @OnEvent(SOS_EVENTS.CREATED)
  async handleSosCreated(event: SosCreatedEvent) {
    this.logger.log(`SOS created: ${event.sosId} — auto-creating incident`);

    try {
      // Get rider info for reporterRole
      const rider = await this.prisma.rider.findUnique({
        where: { id: event.riderId },
        include: { user: true },
      });

      if (!rider) {
        this.logger.error(`Rider not found for SOS ${event.sosId}`);
        return;
      }

      const incident = await this.incidentService.createIncident(
        {
          incidentType: 'ASSAULT', // SOS = assume worst case, security can downgrade
          severity: 'CRITICAL',
          description: `Auto-created from SOS alert ${event.sosId}. Immediate response required.`,
          rideId: event.rideId,
          latitude: event.latitude,
          longitude: event.longitude,
          address: event.address,
          tags: ['sos', 'auto-created'],
        },
        rider.userId,
        rider.user.role,
        'SOS_AUTO', // source
      );

      // Link the SOS alert to the incident via a note
      await this.prisma.incidentNote.create({
        data: {
          incidentId: incident.id,
          authorId: rider.userId,
          content: `Linked SOS Alert ID: ${event.sosId}`,
          isInternal: true,
        },
      });

      this.logger.log(
        `Incident ${incident.incidentNumber} auto-created from SOS ${event.sosId}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to create incident from SOS ${event.sosId}`,
        err,
      );
    }
  }

  // ── On SOS resolved: update linked incident status ───────────────────────

  @OnEvent(SOS_EVENTS.RESOLVED)
  async handleSosResolved(event: SosResolvedEvent) {
    this.logger.log(`SOS resolved: ${event.sosId} — updating linked incident`);

    try {
      // Find the incident linked to this SOS via note
      const note = await this.prisma.incidentNote.findFirst({
        where: {
          content: { contains: event.sosId },
          isInternal: true,
        },
        include: { incident: true },
      });

      if (!note?.incident) {
        this.logger.warn(`No incident found linked to SOS ${event.sosId}`);
        return;
      }

      const incident = note.incident;

      // Only update if still open — don't overwrite if security already acted
      if (['RESOLVED', 'CLOSED'].includes(incident.status)) return;

      await this.incidentService.updateStatus(
        incident.id,
        {
          status: 'RESOLVED',
          note:
            event.resolutionNote ?? `SOS ${event.sosId} resolved by operator.`,
        },
        event.resolvedBy,
      );

      this.logger.log(
        `Incident ${incident.incidentNumber} resolved via SOS bridge`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to resolve incident for SOS ${event.sosId}`,
        err,
      );
    }
  }
}
