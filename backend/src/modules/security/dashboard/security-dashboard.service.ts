import { Injectable } from '@nestjs/common';
import {
  AccountStatus,
  FraudStatus,
  IncidentStatus,
  RideStatus,
  SosStatus,
} from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SecurityDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverviewStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      activeSos,
      openFraud,
      suspiciousAccounts,
      activeRides,
      blockedUsers,
      openIncidents,
    ] = await Promise.all([
      this.prisma.sosAlert.count({ where: { status: SosStatus.ACTIVE } }),
      this.prisma.fraudCase.count({ where: { status: FraudStatus.OPEN } }),
      this.prisma.suspiciousAccount.count({ where: { isResolved: false } }),
      this.prisma.ride.count({
        where: {
          status: {
            in: [
              RideStatus.SEARCHING,
              RideStatus.ACCEPTED,
              RideStatus.ARRIVING,
              RideStatus.IN_PROGRESS,
            ],
          },
        },
      }),
      this.prisma.user.count({ where: { accountStatus: AccountStatus.BLOCKED } }),
      this.prisma.incident.count({
        where: {
          status: { in: [IncidentStatus.OPEN, IncidentStatus.INVESTIGATING] },
          deletedAt: null,
        },
      }),
    ]);

    return {
      activeSos,
      fraudAttempts: openFraud,
      suspiciousAccounts,
      highRiskRides: activeRides,
      blockedUsers,
      openIncidents,
    };
  }

  async getAlertsTrend() {
    const since = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    since.setHours(0, 0, 0, 0);

    const [sosAlerts, fraudCases, incidents] = await Promise.all([
      this.prisma.sosAlert.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      this.prisma.fraudCase.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      this.prisma.incident.findMany({
        where: { createdAt: { gte: since }, deletedAt: null },
        select: { createdAt: true },
      }),
    ]);

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(since);
      date.setDate(since.getDate() + index);
      return date;
    });

    return days.map((date) => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const inDay = (createdAt: Date) =>
        createdAt >= dayStart && createdAt < dayEnd;

      const sos = sosAlerts.filter((row) => inDay(row.createdAt)).length;
      const fraud = fraudCases.filter((row) => inDay(row.createdAt)).length;
      const incident = incidents.filter((row) => inDay(row.createdAt)).length;

      return {
        day: dayStart.toLocaleDateString('en-IN', { weekday: 'short' }),
        sos,
        fraud,
        alerts: sos + fraud + incident,
      };
    });
  }
}
