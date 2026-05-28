import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DriverBehaviorService {
  constructor(private readonly prisma: PrismaService) {}

  async createFlag(dto: {
    captainId: string;
    flagType: string;
    severity: string;
    description?: string;
    rideId?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const captain = await this.prisma.captain.findUnique({
      where: { id: dto.captainId },
    });
    if (!captain) throw new NotFoundException('Captain not found');

    return this.prisma.driverBehaviorFlag.create({
      data: {
        captainId: dto.captainId,
        flagType: dto.flagType,
        severity: dto.severity,
        description: dto.description ?? undefined,
        rideId: dto.rideId ?? undefined,
        latitude: dto.latitude ?? undefined,
        longitude: dto.longitude ?? undefined,
      },
    });
  }

  async getAllFlags(filters?: {
    captainId?: string;
    isReviewed?: boolean;
    severity?: string;
  }) {
    return this.prisma.driverBehaviorFlag.findMany({
      where: {
        ...(filters?.captainId && { captainId: filters.captainId }),
        ...(filters?.severity && { severity: filters.severity }),
        ...(filters?.isReviewed !== undefined && {
          isReviewed: filters.isReviewed,
        }),
      },
      include: {
        captain: { include: { user: true } },
        ride: true,
      },
      orderBy: { detectedAt: 'desc' },
    });
  }

  async getFlagById(id: string) {
    const flag = await this.prisma.driverBehaviorFlag.findUnique({
      where: { id },
      include: {
        captain: { include: { user: true } },
        ride: true,
      },
    });
    if (!flag) throw new NotFoundException('Flag not found');
    return flag;
  }

  async reviewFlag(id: string, opsUserId: string) {
    const flag = await this.prisma.driverBehaviorFlag.findUnique({
      where: { id },
    });
    if (!flag) throw new NotFoundException('Flag not found');

    return this.prisma.driverBehaviorFlag.update({
      where: { id },
      data: {
        isReviewed: true,
        reviewedBy: opsUserId,
        reviewedAt: new Date(),
      },
    });
  }

  async getCaptainList() {
    const captains = await this.prisma.captain.findMany({
      include: {
        user: true,
        rides: {
          where: { status: 'COMPLETED' },
          select: { id: true },
        },
        _count: {
          select: { rides: true },
        },
      },
    });

    const results = await Promise.all(
      captains.map(async (captain) => {
        const [total, highSeverity, aggressiveFlags] = await Promise.all([
          this.prisma.driverBehaviorFlag.count({
            where: { captainId: captain.id },
          }),
          this.prisma.driverBehaviorFlag.count({
            where: { captainId: captain.id, severity: 'HIGH' },
          }),
          this.prisma.driverBehaviorFlag.count({
            where: {
              captainId: captain.id,
              flagType: { in: ['AGGRESSIVE_DRIVING', 'SPEEDING'] },
            },
          }),
        ]);

        const safetyScore = Math.max(0, 100 - highSeverity * 10 - total * 2);

        return {
          captainId: captain.id,
          name: captain.user.fullName,
          phone: captain.user.phoneNumber,
          isOnline: captain.isOnline,
          totalTrips: captain.totalTrips,
          totalFlags: total,
          highSeverityFlags: highSeverity,
          aggressiveFlags,
          safetyScore,
          rating: captain.rating,
        };
      }),
    );

    return results;
  }

  async getCaptainBehaviorSummary(captainId: string) {
    const captain = await this.prisma.captain.findUnique({
      where: { id: captainId },
      include: { user: true },
    });
    if (!captain) throw new NotFoundException('Captain not found');

    const [total, highSeverity, unreviewed, byType] = await Promise.all([
      this.prisma.driverBehaviorFlag.count({ where: { captainId } }),
      this.prisma.driverBehaviorFlag.count({
        where: { captainId, severity: 'HIGH' },
      }),
      this.prisma.driverBehaviorFlag.count({
        where: { captainId, isReviewed: false },
      }),
      this.prisma.driverBehaviorFlag.groupBy({
        by: ['flagType'],
        where: { captainId },
        _count: { flagType: true },
      }),
    ]);

    const safetyScore = Math.max(0, 100 - highSeverity * 10 - total * 2);

    return {
      captainId,
      name: captain.user.fullName,
      phone: captain.user.phoneNumber,
      rating: captain.rating,
      totalTrips: captain.totalTrips,
      isOnline: captain.isOnline,
      safetyScore,
      total,
      highSeverity,
      unreviewed,
      byType,
    };
  }

  async getBehaviorStats() {
    const [total, unreviewed, highSeverity] = await Promise.all([
      this.prisma.driverBehaviorFlag.count(),
      this.prisma.driverBehaviorFlag.count({ where: { isReviewed: false } }),
      this.prisma.driverBehaviorFlag.count({ where: { severity: 'high' } }),
    ]);

    return { total, unreviewed, highSeverity };
  }
}
