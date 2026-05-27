import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  AuditAction,
} from '@prisma/client';

@Injectable()
export class IncidentService {
  constructor(private readonly prisma: PrismaService) {}

  async createIncident(dto: {
    reportedBy: string;
    incidentType: IncidentType;
    severity: IncidentSeverity;
    description: string;
    rideId?: string;
    evidence?: Record<string, any>;
    latitude?: number;
    longitude?: number;
    address?: string;
  }) {
    const incident = await this.prisma.incident.create({
      data: {
        reportedBy: dto.reportedBy,
        incidentType: dto.incidentType,
        severity: dto.severity,
        description: dto.description,
        rideId: dto.rideId ?? undefined,
        evidence: dto.evidence ?? undefined,
        latitude: dto.latitude ?? undefined,
        longitude: dto.longitude ?? undefined,
        address: dto.address ?? undefined,
      },
      include: { user: true, ride: true },
    });

    await this.createAuditLog({
      performedBy: dto.reportedBy,
      action: AuditAction.INCIDENT_CREATED,
      incidentId: incident.id,
      metadata: { incidentType: dto.incidentType, severity: dto.severity },
    });

    return incident;
  }

  async getAllIncidents(filters?: {
    status?: IncidentStatus;
    severity?: IncidentSeverity;
  }) {
    return this.prisma.incident.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.severity && { severity: filters.severity }),
      },
      include: { user: true, ride: true },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getIncidentById(incidentId: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
      include: {
        user: true,
        ride: true,
        auditLogs: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  async assignIncident(incidentId: string, opsUserId: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    return this.prisma.incident.update({
      where: { id: incidentId },
      data: {
        assignedTo: opsUserId,
        assignedAt: new Date(),
        status: IncidentStatus.INVESTIGATING,
      },
    });
  }

  async resolveIncident(
    incidentId: string,
    opsUserId: string,
    dto: {
      status: 'RESOLVED' | 'CLOSED';
      resolutionNote?: string;
    },
  ) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
    });
    if (!incident) throw new NotFoundException('Incident not found');
    if (
      incident.status === IncidentStatus.RESOLVED ||
      incident.status === IncidentStatus.CLOSED
    ) {
      throw new ForbiddenException('Incident already closed');
    }

    const updated = await this.prisma.incident.update({
      where: { id: incidentId },
      data: {
        status: dto.status as IncidentStatus,
        resolvedAt: new Date(),
        resolutionNote: dto.resolutionNote ?? undefined,
      },
    });

    await this.createAuditLog({
      performedBy: opsUserId,
      action: AuditAction.INCIDENT_RESOLVED,
      incidentId,
      metadata: { status: dto.status, note: dto.resolutionNote },
    });

    return updated;
  }

  async getIncidentStats() {
    const [open, investigating, resolvedToday, critical] = await Promise.all([
      this.prisma.incident.count({ where: { status: IncidentStatus.OPEN } }),
      this.prisma.incident.count({
        where: { status: IncidentStatus.INVESTIGATING },
      }),
      this.prisma.incident.count({
        where: {
          status: IncidentStatus.RESOLVED,
          resolvedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.incident.count({
        where: { severity: IncidentSeverity.CRITICAL },
      }),
    ]);

    return { open, investigating, resolvedToday, critical };
  }

  private async createAuditLog(data: {
    performedBy: string;
    action: AuditAction;
    incidentId?: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.auditLog.create({
      data: {
        performedBy: data.performedBy,
        action: data.action,
        incidentId: data.incidentId ?? undefined,
        metadata: data.metadata ?? undefined,
      },
    });
  }
}
