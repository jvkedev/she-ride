import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../prisma/prisma.service';
import { INCIDENT_EVENTS, IncidentSlaBreachedEvent } from './incident.events';

@Injectable()
export class SlaCheckerService {
  private readonly logger = new Logger(SlaCheckerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: EventEmitter2,
  ) {}

  // Runs every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async checkSlaBreaches() {
    const now = new Date();

    // Find incidents past their SLA deadline that haven't been marked breached yet
    const breached = await this.prisma.incident.findMany({
      where: {
        slaDeadline: { lte: now },
        slaBreachedAt: null,
        status: { notIn: ['RESOLVED', 'CLOSED', 'REJECTED'] },
        deletedAt: null,
      },
      select: {
        id: true,
        incidentNumber: true,
        priority: true,
        severity: true,
        assignedTo: true,
      },
    });

    if (breached.length === 0) return;

    this.logger.warn(`SLA check: ${breached.length} breach(es) found`);

    // Stamp slaBreachedAt and emit event for each
    await Promise.all(
      breached.map(async (incident) => {
        await this.prisma.incident.update({
          where: { id: incident.id },
          data: { slaBreachedAt: now },
        });

        const event: IncidentSlaBreachedEvent = {
          incidentId: incident.id,
          incidentNumber: incident.incidentNumber,
          priority: incident.priority,
          severity: incident.severity,
          assignedTo: incident.assignedTo,
        };

        this.emitter.emit(INCIDENT_EVENTS.SLA_BREACHED, event);
      }),
    );
  }
}
