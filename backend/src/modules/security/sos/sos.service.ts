import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RideGateway } from '../../gateway/ride.gateway';
import { RideRedisService } from '../../redis/ride-redis.service';
import {
  SosStatus,
  SosTriggerType,
  AuditAction,
  EmergencyType,
} from '@prisma/client';

const SOS_RIDE_INCLUDE = {
  captain: {
    include: {
      user: {
        select: {
          fullName: true,
          phoneNumber: true,
          email: true,
        },
      },
      vehicle: {
        select: { vehicleType: true, vehicleNumber: true },
      },
    },
  },
} as const;

const ACTIVE_RIDE_STATUSES = [
  'SEARCHING',
  'ACCEPTED',
  'ARRIVING',
  'IN_PROGRESS',
] as const;

@Injectable()
export class SosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rideGateway: RideGateway,
    private readonly rideRedis: RideRedisService,
  ) {}

  // ── TRIGGER SOS ───────────────────────────────
  async triggerSos(
    riderId: string,
    dto: {
      triggerType: SosTriggerType;
      latitude: number;
      longitude: number;
      address?: string;
      rideId?: string;
      triggeredByRole?: 'RIDER' | 'CAPTAIN';
      triggeredByCaptainId?: string;
    },
  ) {
    const rider = await this.prisma.rider.findUnique({
      where: { id: riderId },
    });
    if (!rider) throw new NotFoundException('Rider not found');

    let rideId = dto.rideId ?? null;
    let captainId: string | null = dto.triggeredByCaptainId ?? null;

    if (!rideId || !captainId) {
      const activeRide = await this.prisma.ride.findFirst({
        where: {
          riderId,
          status: { in: [...ACTIVE_RIDE_STATUSES] },
        },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, captainId: true },
      });
      if (activeRide) {
        rideId = rideId ?? activeRide.id;
        captainId = captainId ?? activeRide.captainId ?? null;
      }
    }

    if (rideId && !captainId) {
      const rideRow = await this.prisma.ride.findUnique({
        where: { id: rideId },
        select: { captainId: true },
      });
      captainId = rideRow?.captainId ?? null;
      if (!captainId) {
        const redisState = await this.rideRedis.getRideState(rideId);
        captainId = redisState?.captainId ?? null;
      }
    }

    if (!captainId) {
      const latestWithCaptain = await this.prisma.ride.findFirst({
        where: { riderId, captainId: { not: null } },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, captainId: true },
      });
      if (latestWithCaptain) {
        rideId = rideId ?? latestWithCaptain.id;
        captainId = latestWithCaptain.captainId;
      }
    }

    const sos = await this.prisma.sosAlert.create({
      data: {
        riderId,
        rideId,
        captainId,
        triggerType: dto.triggerType,
        status: SosStatus.ACTIVE,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address ?? null,
      },
      include: {
        rider: { include: { user: true } },
        ride: {
          include: SOS_RIDE_INCLUDE,
        },
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

    this.rideGateway.notifySosCreated({
      sosAlertId: sos.id,
      riderId: sos.riderId,
      riderUserId: sos.rider.userId,
      rideId: sos.rideId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      address: dto.address ?? null,
    });

    return this.enrichSosAlert(sos);
  }

  private async getCaptainLiveCoords(captainId: string | null | undefined) {
    if (!captainId) return { latitude: null, longitude: null };
    const redisLoc = await this.rideRedis.getCaptainLocation(captainId);
    if (redisLoc?.lat != null && redisLoc?.lng != null) {
      return { latitude: redisLoc.lat, longitude: redisLoc.lng };
    }
    const captain = await this.prisma.captain.findUnique({
      where: { id: captainId },
      select: { currentLatitude: true, currentLongitude: true },
    });
    return {
      latitude: captain?.currentLatitude ?? null,
      longitude: captain?.currentLongitude ?? null,
    };
  }

  private async loadCaptain(captainId: string) {
    return this.prisma.captain.findUnique({
      where: { id: captainId },
      include: SOS_RIDE_INCLUDE.captain.include,
    });
  }

  private async resolveCaptainIdForAlert(alert: {
    id: string;
    riderId: string;
    rideId?: string | null;
    captainId?: string | null;
    ride?: { captainId?: string | null } | null;
  }): Promise<string | null> {
    if (alert.captainId) return alert.captainId;

    const ride = await this.resolveRideForAlert(alert);
    if ((ride as { captainId?: string | null })?.captainId) {
      return (ride as { captainId: string }).captainId;
    }

    if (alert.rideId) {
      const redisState = await this.rideRedis.getRideState(alert.rideId);
      if (redisState?.captainId) return redisState.captainId;
    }

    const latest = await this.prisma.ride.findFirst({
      where: { riderId: alert.riderId, captainId: { not: null } },
      orderBy: { updatedAt: 'desc' },
      select: { captainId: true },
    });
    return latest?.captainId ?? null;
  }

  private async hydrateCaptainOnRide(
    ride: {
      captainId?: string | null;
      captain?: {
        user?: { fullName?: string; phoneNumber?: string };
      } | null;
    } | null,
  ) {
    if (!ride?.captainId) return ride;
    if (ride.captain?.user?.fullName) return ride;

    const captain = await this.prisma.captain.findUnique({
      where: { id: ride.captainId },
      include: SOS_RIDE_INCLUDE.captain.include,
    });
    if (!captain) return ride;
    return { ...ride, captain };
  }

  private async resolveRideForAlert(alert: {
    id: string;
    riderId: string;
    rideId?: string | null;
    ride?: {
      id?: string;
      captainId?: string | null;
      captain?: { user?: { fullName?: string; phoneNumber?: string } } | null;
    } | null;
  }) {
    const tryRide = async (ride: Awaited<
      ReturnType<typeof this.prisma.ride.findFirst>
    >) => {
      if (!ride?.captainId) return null;
      return this.hydrateCaptainOnRide(ride);
    };

    if (alert.rideId) {
      const byId = await this.prisma.ride.findUnique({
        where: { id: alert.rideId },
        include: SOS_RIDE_INCLUDE,
      });
      const hydrated = await tryRide(byId);
      if (hydrated) return hydrated;
    }

    if (alert.ride?.captainId) {
      const hydrated = await this.hydrateCaptainOnRide(alert.ride);
      if (hydrated?.captain?.user) return hydrated;
    }

    const activeRide = await this.prisma.ride.findFirst({
      where: {
        riderId: alert.riderId,
        captainId: { not: null },
        status: { in: [...ACTIVE_RIDE_STATUSES] },
      },
      orderBy: { updatedAt: 'desc' },
      include: SOS_RIDE_INCLUDE,
    });
    const activeHydrated = await tryRide(activeRide);
    if (activeHydrated) return activeHydrated;

    const latestWithCaptain = await this.prisma.ride.findFirst({
      where: {
        riderId: alert.riderId,
        captainId: { not: null },
      },
      orderBy: { updatedAt: 'desc' },
      include: SOS_RIDE_INCLUDE,
    });
    const latestHydrated = await tryRide(latestWithCaptain);
    if (latestHydrated) return latestHydrated;

    const activeRides = await this.prisma.ride.findMany({
      where: {
        riderId: alert.riderId,
        status: { in: [...ACTIVE_RIDE_STATUSES] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: SOS_RIDE_INCLUDE,
    });

    for (const candidate of activeRides) {
      if (candidate.captainId) {
        const hydrated = await tryRide(candidate);
        if (hydrated) return hydrated;
      }
      const redisState = await this.rideRedis.getRideState(candidate.id);
      if (redisState?.captainId) {
        const hydrated = await this.hydrateCaptainOnRide({
          ...candidate,
          captainId: redisState.captainId,
        });
        if (hydrated?.captain?.user) return hydrated;
      }
    }

    return alert.ride ?? null;
  }

  private async enrichSosAlert<T extends Record<string, unknown>>(
    alert: T & {
      id: string;
      riderId: string;
      rideId?: string | null;
      captainId?: string | null;
    },
  ) {
    let ride = await this.resolveRideForAlert(alert);
    let captainId =
      alert.captainId ??
      (ride as { captainId?: string | null })?.captainId ??
      (await this.resolveCaptainIdForAlert(alert));

    if (!captainId && alert.rideId) {
      const redisState = await this.rideRedis.getRideState(alert.rideId);
      captainId = redisState?.captainId ?? null;
    }

    let captain = (ride as { captain?: object })?.captain ?? null;
    if (captainId && !(captain as { user?: { fullName?: string } })?.user?.fullName) {
      captain = await this.loadCaptain(captainId);
    }

    if (captainId && captain) {
      if (ride) {
        ride = { ...(ride as object), captainId, captain } as typeof ride;
      } else {
        const fallbackRide = await this.prisma.ride.findFirst({
          where: { riderId: alert.riderId, captainId },
          orderBy: { updatedAt: 'desc' },
        });
        ride = fallbackRide
          ? { ...fallbackRide, captainId, captain }
          : { captainId, captain };
      }
    }

    const captainLive = await this.getCaptainLiveCoords(captainId);

    const resolvedRideId = (ride as { id?: string })?.id;
    const updates: { rideId?: string; captainId?: string } = {};
    if (resolvedRideId && resolvedRideId !== alert.rideId) {
      updates.rideId = resolvedRideId;
    }
    if (captainId && captainId !== alert.captainId) {
      updates.captainId = captainId;
    }
    if (Object.keys(updates).length > 0) {
      await this.prisma.sosAlert
        .update({ where: { id: alert.id }, data: updates })
        .catch(() => undefined);
    }

    return {
      ...alert,
      ...updates,
      ride,
      captain,
      captainId: captainId ?? alert.captainId ?? null,
      captainLive,
    };
  }

  private async enrichSosAlerts<T extends Record<string, unknown>>(alerts: T[]) {
    return Promise.all(alerts.map((a) => this.enrichSosAlert(a)));
  }

  // ── PUSH LIVE LOCATION SNAPSHOT ───────────────
  async pushLocationSnapshot(
    sosAlertId: string,
    userId: string,
    role: string,
    dto: {
      latitude: number;
      longitude: number;
    },
  ) {
    const sos = await this.prisma.sosAlert.findUnique({
      where: { id: sosAlertId },
      include: {
        ride: { select: { captainId: true } },
        rider: { select: { userId: true } },
      },
    });
    if (!sos) throw new NotFoundException('SOS alert not found');
    if (sos.status !== SosStatus.ACTIVE) {
      throw new ForbiddenException('SOS is no longer active');
    }

    if (role === 'RIDER') {
      const rider = await this.prisma.rider.findUnique({ where: { userId } });
      if (!rider || rider.id !== sos.riderId) {
        throw new ForbiddenException('Not allowed to update this SOS location');
      }
    } else if (role === 'CAPTAIN') {
      const captain = await this.prisma.captain.findUnique({ where: { userId } });
      if (!captain || sos.ride?.captainId !== captain.id) {
        throw new ForbiddenException('Not allowed to update this SOS location');
      }
    }

    const [snapshot] = await Promise.all([
      this.prisma.sosLocationSnapshot.create({
        data: {
          sosAlertId,
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
      }),
      this.prisma.sosAlert.update({
        where: { id: sosAlertId },
        data: {
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
      }),
    ]);

    this.rideGateway.notifySosLocation({
      sosAlertId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      capturedAt: snapshot.capturedAt.toISOString(),
      role: role === 'CAPTAIN' ? 'CAPTAIN' : 'RIDER',
    });

    if (role === 'CAPTAIN') {
      const captain = await this.prisma.captain.findUnique({ where: { userId } });
      if (captain) {
        await this.prisma.captain.update({
          where: { id: captain.id },
          data: {
            currentLatitude: dto.latitude,
            currentLongitude: dto.longitude,
          },
        });
        if (sos.ride?.captainId) {
          await this.rideRedis.setCaptainLocation({
            captainId: captain.id,
            userId,
            lat: dto.latitude,
            lng: dto.longitude,
            updatedAt: snapshot.capturedAt.toISOString(),
          });
        }
      }
    }

    return snapshot;
  }

  // ── GET ALL ACTIVE SOS (ops dashboard) ────────
  async getActiveSosAlerts() {
    const alerts = await this.prisma.sosAlert.findMany({
      where: { status: SosStatus.ACTIVE },
      include: {
        rider: { include: { user: true } },
        captain: { include: SOS_RIDE_INCLUDE.captain.include },
        ride: {
          include: SOS_RIDE_INCLUDE,
        },
        locationSnapshots: {
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
        emergencyServices: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return this.enrichSosAlerts(alerts);
  }

  // ── GET SINGLE SOS DETAIL ─────────────────────
  async getSosById(sosAlertId: string) {
    const sos = await this.prisma.sosAlert.findUnique({
      where: { id: sosAlertId },
      include: {
        rider: { include: { user: true } },
        captain: { include: SOS_RIDE_INCLUDE.captain.include },
        ride: { include: SOS_RIDE_INCLUDE },
        locationSnapshots: { orderBy: { capturedAt: 'asc' } },
        emergencyServices: true,
        auditLogs: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!sos) throw new NotFoundException('SOS alert not found');
    return this.enrichSosAlert(sos);
  }

  async getMyActiveSos(userId: string, role: 'RIDER' | 'CAPTAIN') {
    if (role === 'RIDER') {
      const rider = await this.prisma.rider.findUnique({ where: { userId } });
      if (!rider) throw new NotFoundException('Rider profile not found');
      const sos = await this.prisma.sosAlert.findFirst({
        where: { riderId: rider.id, status: SosStatus.ACTIVE },
        include: {
          rider: { include: { user: true } },
          captain: { include: SOS_RIDE_INCLUDE.captain.include },
          ride: {
            include: SOS_RIDE_INCLUDE,
          },
          locationSnapshots: { orderBy: { capturedAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (!sos) return null;
      return this.enrichSosAlert(sos);
    }

    const captain = await this.prisma.captain.findUnique({ where: { userId } });
    if (!captain) throw new NotFoundException('Captain profile not found');

    const sos = await this.prisma.sosAlert.findFirst({
      where: {
        status: SosStatus.ACTIVE,
        OR: [
          { captainId: captain.id },
          { ride: { captainId: captain.id } },
        ],
      },
      include: {
        rider: { include: { user: true } },
        captain: { include: SOS_RIDE_INCLUDE.captain.include },
        ride: {
          include: SOS_RIDE_INCLUDE,
        },
        locationSnapshots: { orderBy: { capturedAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!sos) return null;
    return this.enrichSosAlert(sos);
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

    this.rideGateway.notifySosResolved({ sosAlertId });

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
