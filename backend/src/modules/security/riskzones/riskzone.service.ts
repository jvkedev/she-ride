import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RiskLevel, AuditAction } from '@prisma/client';

@Injectable()
export class RiskZoneService {
  constructor(private readonly prisma: PrismaService) {}

  async createRiskZone(
    opsUserId: string,
    dto: {
      name: string;
      riskLevel: RiskLevel;
      centerLatitude: number;
      centerLongitude: number;
      radiusInMeters: number;
      description?: string;
    },
  ) {
    const zone = await this.prisma.riskZone.create({
      data: {
        name: dto.name,
        riskLevel: dto.riskLevel,
        centerLatitude: dto.centerLatitude,
        centerLongitude: dto.centerLongitude,
        radiusInMeters: dto.radiusInMeters,
        description: dto.description ?? undefined,
        createdBy: opsUserId,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        performedBy: opsUserId,
        action: AuditAction.RISK_ZONE_ADDED,
        metadata: { zoneId: zone.id, name: zone.name },
      },
    });

    return zone;
  }

  async getAllRiskZones(filters?: {
    isActive?: boolean;
    riskLevel?: RiskLevel;
  }) {
    return this.prisma.riskZone.findMany({
      where: {
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters?.riskLevel !== undefined && {
          riskLevel: filters.riskLevel,
        }),
      },
      orderBy: [{ riskLevel: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getRiskZoneById(id: string) {
    const zone = await this.prisma.riskZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('Risk zone not found');
    return zone;
  }

  async updateRiskZone(
    id: string,
    dto: Partial<{
      name: string;
      riskLevel: RiskLevel;
      centerLatitude: number;
      centerLongitude: number;
      radiusInMeters: number;
      description: string;
      isActive: boolean;
    }>,
  ) {
    const zone = await this.prisma.riskZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('Risk zone not found');

    return this.prisma.riskZone.update({ where: { id }, data: dto });
  }

  async deleteRiskZone(id: string, opsUserId: string) {
    const zone = await this.prisma.riskZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException('Risk zone not found');

    await this.prisma.riskZone.update({
      where: { id },
      data: { isActive: false },
    });

    await this.prisma.auditLog.create({
      data: {
        performedBy: opsUserId,
        action: AuditAction.RISK_ZONE_REMOVED,
        metadata: { zoneId: id, name: zone.name },
      },
    });

    return { message: 'Risk zone deactivated' };
  }

  async checkPointInRiskZone(latitude: number, longitude: number) {
    const zones = await this.prisma.riskZone.findMany({
      where: { isActive: true },
    });

    const matched = zones.filter((zone) => {
      const distanceInMeters = this.haversineDistance(
        latitude,
        longitude,
        zone.centerLatitude,
        zone.centerLongitude,
      );
      return distanceInMeters <= zone.radiusInMeters;
    });

    return { isRisky: matched.length > 0, zones: matched };
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
