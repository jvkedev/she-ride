import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  IncidentPriority,
  IncidentSource,
  AuditAction,
  UserRole,
} from '@prisma/client';
import { CreateIncidentDto } from './dto/create-incident.dto';
import {
  UpdateIncidentStatusDto,
  AssignIncidentDto,
  UpdateIncidentPriorityDto,
} from './dto/update-incident.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { QueryIncidentsDto } from './dto/query-incidents.dto';
// ── SLA deadlines per priority ────────────────────────────────────────────────
const SLA_MINUTES: Record<IncidentPriority, number> = {
  P1: 2,
  P2: 10,
  P3: 60,
  P4: 1440, // 24 hours
};

// ── Valid status transitions ──────────────────────────────────────────────────
const VALID_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  OPEN: ['INVESTIGATING', 'REJECTED', 'CLOSED'],
  INVESTIGATING: ['RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  REJECTED: [],
};

@Injectable()
export class IncidentService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async generateIncidentNumber(): Promise<string> {
    const count = await this.prisma.incident.count();
    const next = count + 1;
    return `INC-${String(next).padStart(3, '0')}`; // INC-001, INC-042, INC-204
  }

  private getSlaDeadline(priority: IncidentPriority): Date {
    const minutes = SLA_MINUTES[priority];
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private derivePriority(severity: IncidentSeverity): IncidentPriority {
    const map: Record<IncidentSeverity, IncidentPriority> = {
      CRITICAL: 'P1',
      HIGH: 'P2',
      MEDIUM: 'P3',
      LOW: 'P4',
    };
    return map[severity];
  }

  private validateTransition(from: IncidentStatus, to: IncidentStatus) {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Cannot transition from ${from} to ${to}. Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }
  }

  private async createAuditLog(data: {
    performedBy: string;
    action: AuditAction;
    incidentId?: string;
    metadata?: Record<string, any>;
    previousData?: Record<string, any>;
    newData?: Record<string, any>;
    ipAddress?: string;
    channel?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        performedBy: data.performedBy,
        action: data.action,
        incidentId: data.incidentId,
        metadata: data.metadata,
        previousData: data.previousData,
        newData: data.newData,
        ipAddress: data.ipAddress,
        channel: data.channel ?? 'api',
      },
    });
  }

  // ── Create ───────────────────────────────────────────────────────────────────

  async createIncident(
    dto: CreateIncidentDto,
    reportedBy: string,
    reporterRole: UserRole,
    source: IncidentSource = 'APP',
    ipAddress?: string,
  ) {
    const incidentNumber = await this.generateIncidentNumber();
    const priority = this.derivePriority(dto.severity);
    const slaDeadline = this.getSlaDeadline(priority);

    const incident = await this.prisma.incident.create({
      data: {
        incidentNumber,
        reportedBy,
        reporterRole,
        incidentType: dto.incidentType,
        severity: dto.severity,
        priority,
        source,
        description: dto.description,
        rideId: dto.rideId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        tags: dto.tags ?? [],
        slaDeadline,
      },
      include: { user: true, ride: true },
    });

    await this.createAuditLog({
      performedBy: reportedBy,
      action: 'INCIDENT_CREATED',
      incidentId: incident.id,
      newData: { incidentNumber, priority, slaDeadline },
      ipAddress,
    });

    return incident;
  }

  // ── List (paginated) ─────────────────────────────────────────────────────────

  async getAllIncidents(query: QueryIncidentsDto) {
    const limit = query.limit ?? 20;

    const where = {
      deletedAt: null,
      ...(query.status && { status: query.status }),
      ...(query.severity && { severity: query.severity }),
      ...(query.priority && { priority: query.priority }),
      ...(query.assignedTo && { assignedTo: query.assignedTo }),
      ...(query.search && {
        OR: [
          {
            incidentNumber: {
              contains: query.search,
              mode: 'insensitive' as const,
            },
          },
          {
            description: {
              contains: query.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const incidents = await this.prisma.incident.findMany({
      where,
      take: limit + 1, // fetch one extra to determine if there's a next page
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: { select: { id: true, fullName: true, role: true } },
        assignedUser: { select: { id: true, fullName: true } },
        ride: { select: { id: true, pickupAddress: true, dropAddress: true } },
        _count: { select: { notes: true, evidence: true } },
      },
    });

    const hasNextPage = incidents.length > limit;
    const data = hasNextPage ? incidents.slice(0, -1) : incidents;
    const nextCursor = hasNextPage ? data[data.length - 1].id : null;

    return { data, nextCursor, hasNextPage };
  }

  // ── Get own incidents (rider/captain) ────────────────────────────────────────

  async getMyIncidents(userId: string, query: QueryIncidentsDto) {
    return this.getAllIncidents({ ...query, assignedTo: undefined });
  }

  // ── Get by ID ────────────────────────────────────────────────────────────────

  async getIncidentById(
    incidentId: string,
    requesterId: string,
    requesterRole: UserRole,
  ) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            role: true,
            captain: { select: { id: true } },
            rider: { select: { id: true } },
          },
        },
        assignedUser: { select: { id: true, fullName: true } },
        ride: {
          select: {
            id: true,
            pickupAddress: true,
            dropAddress: true,
            status: true,
            captainId: true,
            riderId: true,
            captain: {
              select: {
                id: true,
                user: { select: { fullName: true } },
              },
            },
            rider: {
              select: {
                id: true,
                user: { select: { fullName: true } },
              },
            },
          },
        },
        notes: {
          where:
            requesterRole === 'SECURITY' || requesterRole === 'ADMIN'
              ? {}
              : { isInternal: false }, // riders/captains only see external notes
          include: {
            author: { select: { id: true, fullName: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        evidence: true,
        auditLogs:
          requesterRole === 'SECURITY' || requesterRole === 'ADMIN'
            ? { orderBy: { createdAt: 'asc' } }
            : false,
      },
    });

    if (!incident) throw new NotFoundException('Incident not found');

    // Riders/captains can only view their own
    if (
      requesterRole !== 'SECURITY' &&
      requesterRole !== 'ADMIN' &&
      incident.reportedBy !== requesterId
    ) {
      throw new ForbiddenException('You do not have access to this incident');
    }

    return incident;
  }

  // ── Assign ───────────────────────────────────────────────────────────────────

  async assignIncident(
    incidentId: string,
    dto: AssignIncidentDto,
    assignedBy: string,
  ) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId, deletedAt: null },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    // Verify assignee is SECURITY or ADMIN
    const assignee = await this.prisma.user.findUnique({
      where: { id: dto.assigneeId },
    });
    if (!assignee || !['SECURITY', 'ADMIN'].includes(assignee.role)) {
      throw new BadRequestException(
        'Assignee must be a SECURITY or ADMIN user',
      );
    }

    const previous = {
      assignedTo: incident.assignedTo,
      status: incident.status,
    };

    const updated = await this.prisma.incident.update({
      where: { id: incidentId },
      data: {
        assignedTo: dto.assigneeId,
        assignedAt: new Date(),
        firstResponseAt: incident.firstResponseAt ?? new Date(), // set once
        status: incident.status === 'OPEN' ? 'INVESTIGATING' : incident.status,
      },
    });

    await this.createAuditLog({
      performedBy: assignedBy,
      action: 'INCIDENT_ASSIGNED',
      incidentId,
      previousData: previous,
      newData: {
        assignedTo: dto.assigneeId,
        assigneeName: assignee.fullName,
        status: updated.status,
      },
    });

    return updated;
  }

  // ── Update status ────────────────────────────────────────────────────────────

  async updateStatus(
    incidentId: string,
    dto: UpdateIncidentStatusDto,
    updatedBy: string,
    ipAddress?: string,
  ) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId, deletedAt: null },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    this.validateTransition(incident.status, dto.status);

    // Note is required when rejecting or resolving
    if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(dto.status) && !dto.note) {
      throw new BadRequestException(
        `A note is required when marking as ${dto.status}`,
      );
    }

    const previous = { status: incident.status };

    const updated = await this.prisma.incident.update({
      where: { id: incidentId },
      data: {
        status: dto.status,
        resolvedAt:
          dto.status === 'RESOLVED' ? new Date() : incident.resolvedAt,
        resolvedBy: dto.status === 'RESOLVED' ? updatedBy : incident.resolvedBy,
        closedAt: dto.status === 'CLOSED' ? new Date() : incident.closedAt,
      },
    });

    // Auto-add a note on resolution/rejection
    if (dto.note) {
      await this.prisma.incidentNote.create({
        data: {
          incidentId,
          authorId: updatedBy,
          content: dto.note,
          isInternal: false, // resolution notes are visible to reporter
        },
      });
    }

    await this.createAuditLog({
      performedBy: updatedBy,
      action:
        dto.status === 'RESOLVED'
          ? 'INCIDENT_RESOLVED'
          : 'INCIDENT_STATUS_CHANGED',
      incidentId,
      previousData: previous,
      newData: { status: dto.status },
      ipAddress,
    });

    return updated;
  }

  // ── Update priority ──────────────────────────────────────────────────────────

  async updatePriority(
    incidentId: string,
    dto: UpdateIncidentPriorityDto,
    updatedBy: string,
  ) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId, deletedAt: null },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    const slaDeadline = this.getSlaDeadline(dto.priority);

    return this.prisma.incident.update({
      where: { id: incidentId },
      data: { priority: dto.priority, slaDeadline },
    });
  }

  // ── Notes ────────────────────────────────────────────────────────────────────

  async addNote(incidentId: string, dto: AddNoteDto, authorId: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId, deletedAt: null },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    const note = await this.prisma.incidentNote.create({
      data: {
        incidentId,
        authorId,
        content: dto.content,
        isInternal: dto.isInternal ?? true,
      },
      include: { author: { select: { id: true, fullName: true, role: true } } },
    });

    await this.createAuditLog({
      performedBy: authorId,
      action: 'INCIDENT_NOTE_ADDED',
      incidentId,
      metadata: { isInternal: dto.isInternal ?? true },
    });

    return note;
  }

  // ── Timeline ─────────────────────────────────────────────────────────────────

  async getTimeline(incidentId: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId, deletedAt: null },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    const [auditLogs, notes] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { incidentId },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.incidentNote.findMany({
        where: { incidentId },
        include: {
          author: { select: { id: true, fullName: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Merge and sort into single chronological timeline
    const timeline = [
      ...auditLogs.map((log) => ({
        type: 'audit' as const,
        timestamp: log.createdAt,
        data: log,
      })),
      ...notes.map((note) => ({
        type: 'note' as const,
        timestamp: note.createdAt,
        data: note,
      })),
    ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return timeline;
  }

  // ── Stats ────────────────────────────────────────────────────────────────────

  async getIncidentStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [open, investigating, resolvedToday, critical, slaBreached] =
      await Promise.all([
        this.prisma.incident.count({
          where: { status: 'OPEN', deletedAt: null },
        }),
        this.prisma.incident.count({
          where: { status: 'INVESTIGATING', deletedAt: null },
        }),
        this.prisma.incident.count({
          where: {
            status: 'RESOLVED',
            resolvedAt: { gte: today },
            deletedAt: null,
          },
        }),
        this.prisma.incident.count({
          where: { severity: 'CRITICAL', deletedAt: null },
        }),
        this.prisma.incident.count({
          where: {
            slaBreachedAt: { not: null },
            status: { notIn: ['RESOLVED', 'CLOSED'] },
            deletedAt: null,
          },
        }),
      ]);

    return { open, investigating, resolvedToday, critical, slaBreached };
  }

  // ── Soft delete ──────────────────────────────────────────────────────────────

  async softDelete(incidentId: string, deletedBy: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId, deletedAt: null },
    });
    if (!incident) throw new NotFoundException('Incident not found');

    return this.prisma.incident.update({
      where: { id: incidentId },
      data: { deletedAt: new Date() },
    });
  }
}
