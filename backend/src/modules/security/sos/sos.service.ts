import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  SosStatus,
  SosTriggerType,
  AuditAction,
  EmergencyType,
} from '@prisma/client';

@Injectable()
export class SosService {
  constructor(private readonly prisma: PrismaService) {}

  // ── TRIGGER SOS ───────────────────────────────
  async triggerSos(
    riderId: string,
    dto: {
      triggerType: SosTriggerType;
      latitude: number;
      longitude: number;
      address?: string;
      rideId?: string;
    },
  ) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId },
    });
    if (!rider) throw new NotFoundException('Rider not found');

    const sos = await this.prisma.sosAlert.create({
      data: {
        riderId,
        rideId: dto.rideId ?? null,
        triggerType: dto.triggerType,
        status: SosStatus.ACTIVE,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address ?? null,
      },
      include: {
        rider: { include: { user: true } },
        ride: true,
      },
    });

    // seed first location snapshot
    await this.prisma.sosLocationSnapshot.create({
      data: {
        sosAlertId: sos.id,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    // audit
    await this.createAuditLog({
      performedBy: riderId,
      action: AuditAction.SOS_CREATED,
      sosAlertId: sos.id,
      metadata: { triggerType: dto.triggerType },
    });

    return sos;
  }

  // ── PUSH LIVE LOCATION SNAPSHOT ───────────────
  async pushLocationSnapshot(
    sosAlertId: string,
    dto: {
      latitude: number;
      longitude: number;
    },
  ) {
    const sos = await this.prisma.sosAlert.findUnique({
      where: { id: sosAlertId },
    });
    if (!sos) throw new NotFoundException('SOS alert not found');
    if (sos.status !== SosStatus.ACTIVE) {
      throw new ForbiddenException('SOS is no longer active');
    }

    return this.prisma.sosLocationSnapshot.create({
      data: {
        sosAlertId,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
  }

  // ── GET ALL ACTIVE SOS (ops dashboard) ────────
  async getActiveSosAlerts() {
    return this.prisma.sosAlert.findMany({
      where: { status: SosStatus.ACTIVE },
      include: {
        rider: { include: { user: true } },
        ride: true,
        locationSnapshots: {
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
        emergencyServices: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── GET SINGLE SOS DETAIL ─────────────────────
  async getSosById(sosAlertId: string) {
    const sos = await this.prisma.sosAlert.findUnique({
      where: { id: sosAlertId },
      include: {
        rider: { include: { user: true } },
        ride: { include: { captain: { include: { user: true } } } },
        locationSnapshots: { orderBy: { capturedAt: 'asc' } },
        emergencyServices: true,
        auditLogs: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!sos) throw new NotFoundException('SOS alert not found');
    return sos;
  }

  // ── RESOLVE SOS ───────────────────────────────
  async resolveSos(
    sosAlertId: string,
    opsUserId: string,
    dto: {
      status: 'RESOLVED' | 'FALSE_ALARM';
      resolutionNote?: string;
    },
  ) {
    const sos = await this.prisma.sosAlert.findUnique({
      where: { id: sosAlertId },
    });
    if (!sos) throw new NotFoundException('SOS alert not found');
    if (sos.status !== SosStatus.ACTIVE) {
      throw new ForbiddenException('SOS is already resolved');
    }

    const updated = await this.prisma.sosAlert.update({
      where: { id: sosAlertId },
      data: {
        status: dto.status,
        handledBy: opsUserId,
        handledAt: new Date(),
        resolvedAt: new Date(),
        resolutionNote: dto.resolutionNote ?? null,
      },
    });

    await this.createAuditLog({
      performedBy: opsUserId,
      action: AuditAction.SOS_RESOLVED,
      sosAlertId,
      metadata: { status: dto.status, note: dto.resolutionNote },
    });

    return updated;
  }

  // ── DISPATCH EMERGENCY SERVICE ─────────────────
  async dispatchEmergency(
    sosAlertId: string,
    opsUserId: string,
    dto: {
      emergencyType: EmergencyType;
      notes?: string;
    },
  ) {
    const sos = await this.prisma.sosAlert.findUnique({
      where: { id: sosAlertId },
    });
    if (!sos) throw new NotFoundException('SOS alert not found');

    const dispatch = await this.prisma.emergencyDispatch.create({
      data: {
        sosAlertId: sosAlertId,
        emergencyType: dto.emergencyType,
        dispatchedBy: opsUserId,
        notes: dto.notes ?? null,
      },
    });

    await this.createAuditLog({
      performedBy: opsUserId,
      action: AuditAction.EMERGENCY_DISPATCHED,
      sosAlertId,
      metadata: { emergencyType: dto.emergencyType },
    });

    return dispatch;
  }

  // ── GET SOS HISTORY FOR A RIDER ───────────────
  async getRiderSosHistory(riderId: string) {
    return this.prisma.sosAlert.findMany({
      where: { riderId },
      include: {
        emergencyServices: true,
        auditLogs: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── SOS STATS (overview cards) ────────────────
  async getSosStats() {
    const [active, resolvedToday, falseAlarms, totalThisWeek] =
      await Promise.all([
        this.prisma.sosAlert.count({
          where: { status: SosStatus.ACTIVE },
        }),
        this.prisma.sosAlert.count({
          where: {
            status: SosStatus.RESOLVED,
            resolvedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
        this.prisma.sosAlert.count({
          where: { status: SosStatus.FALSE_ALARM },
        }),
        this.prisma.sosAlert.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    return { active, resolvedToday, falseAlarms, totalThisWeek };
  }

  // ── PRIVATE: AUDIT LOG HELPER ─────────────────
  private async createAuditLog(data: {
    performedBy: string;
    action: AuditAction;
    sosAlertId?: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.auditLog.create({
      data: {
        performedBy: data.performedBy,
        action: data.action,
        sosAlertId: data.sosAlertId ?? undefined,
        metadata: data.metadata ?? undefined, // ✅ undefined is fine
      },
    });
  }
}
