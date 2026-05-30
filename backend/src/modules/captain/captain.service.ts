import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentStatus, RideStatus, AuditAction } from '@prisma/client';
import { UpdateCaptainProfileDto } from './dto/update-captain-profile.dto';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { RideRedisService } from '../redis/ride-redis.service';
import { CaptainVerificationService } from './captain-verification.service';

@Injectable()
export class CaptainService {
  constructor(
    private prisma: PrismaService,
    private rideRedis: RideRedisService,
    private verificationService: CaptainVerificationService,
    private cloudinary: CloudinaryService,
  ) {}

  async getDashboard(userId: string) {
    const captain = await this.prisma.captain.findUnique({
      where: { userId },
      include: {
        user: { select: { fullName: true } },
        vehicle: { select: { vehicleType: true, vehicleNumber: true } },
      },
    });
    if (!captain) throw new NotFoundException('Captain profile not found');

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const [todayRides, activeRide, searchingCount] = await Promise.all([
      this.prisma.ride.findMany({
        where: {
          captainId: captain.id,
          status: RideStatus.COMPLETED,
          completedAt: { gte: startOfToday, lt: endOfToday },
        },
        select: { finalFare: true, estimatedFare: true },
      }),
      this.prisma.ride.findFirst({
        where: {
          captainId: captain.id,
          status: {
            in: [
              RideStatus.ACCEPTED,
              RideStatus.ARRIVING,
              RideStatus.IN_PROGRESS,
            ],
          },
        },
        select: { id: true, status: true },
      }),
      this.prisma.ride.count({
        where: {
          status: RideStatus.SEARCHING,
          vehicleType: captain.vehicle?.vehicleType,
        },
      }),
    ]);

    const todayEarnings = todayRides.reduce(
      (sum, r) => sum + (r.finalFare ?? r.estimatedFare ?? 0),
      0,
    );

    return {
      captain: {
        name: captain.user.fullName,
        isOnline: captain.isOnline,
        rating: captain.rating,
        totalTrips: captain.totalTrips,
        vehicleType: captain.vehicle?.vehicleType ?? null,
        plateNumber: captain.vehicle?.vehicleNumber ?? null,
      },
      today: {
        trips: todayRides.length,
        earnings: todayEarnings,
      },
      activeRide: activeRide
        ? { rideId: activeRide.id, status: activeRide.status }
        : null,
      nearbyRequests: searchingCount,
    };
  }

  async getEarnings(userId: string) {
    const captain = await this.prisma.captain.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!captain) {
      throw new NotFoundException('Captain profile not found');
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);

    const completedRides = await this.prisma.ride.findMany({
      where: {
        captainId: captain.id,
        status: RideStatus.COMPLETED,
        completedAt: { gte: startOfWeek, lt: endOfToday },
      },
      select: {
        finalFare: true,
        completedAt: true,
      },
    });

    const ridesWithCompletedAt = completedRides.filter(
      (ride): ride is { finalFare: number | null; completedAt: Date } =>
        ride.completedAt !== null,
    );

    const dailyCompletedRides = ridesWithCompletedAt.filter(
      (ride) =>
        ride.completedAt >= startOfToday && ride.completedAt < endOfToday,
    );

    const totalCompletedRides = ridesWithCompletedAt.length;
    const totalEarnings = ridesWithCompletedAt.reduce(
      (sum, ride) => sum + (ride.finalFare ?? 0),
      0,
    );

    const todayEarnings = dailyCompletedRides.reduce(
      (sum, ride) => sum + (ride.finalFare ?? 0),
      0,
    );

    const allWeeklyAssignedRides = await this.prisma.ride.count({
      where: {
        captainId: captain.id,
        completedAt: { gte: startOfWeek, lt: endOfToday },
        status: { in: [RideStatus.COMPLETED, RideStatus.CANCELED] },
      },
    });

    const peakHour = this.getPeakHour(ridesWithCompletedAt);
    const netPayout = totalEarnings;
    const todayNetPayout = todayEarnings;
    const avgPerTrip = totalCompletedRides
      ? parseFloat((totalEarnings / totalCompletedRides).toFixed(2))
      : 0;
    const completionRate = allWeeklyAssignedRides
      ? `${Math.round((totalCompletedRides / allWeeklyAssignedRides) * 100)}%`
      : '100%';

    const weekly = this.getWeeklyMap(startOfWeek, ridesWithCompletedAt);
    const weeklyTotal = weekly.reduce((sum, day) => sum + day.amount, 0);

    return {
      dailySummary: {
        total: todayEarnings,
        trips: dailyCompletedRides.length,
        netPayout: todayNetPayout,
        tripFares: todayEarnings,
      },
      summary: {
        total: totalEarnings,
        trips: totalCompletedRides,
        netPayout,
        tripFares: totalEarnings,
      },
      weekly,
      weekStats: {
        totalTrips: totalCompletedRides,
        avgPerTrip,
        completionRate,
        peakHours: peakHour,
        weekTotal: weeklyTotal,
      },
    };
  }

  async getDocuments(userId: string) {
    return this.verificationService.getDocumentsForCaptain(userId);
  }

  async uploadDocument(
    userId: string,
    documentType: string,
    file: Express.Multer.File,
  ) {
    return this.verificationService.uploadDocument(userId, documentType, file);
  }

  async updateProfilePhoto(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ profileImage: string }> {
    const profileImage = await this.cloudinary.uploadFile(
      file,
      'captain-photos',
    );

    await this.prisma.captain.update({
      where: { userId },
      data: { profileImage },
    });

    return { profileImage };
  }

  async getProfile(userId: string) {
    const captain = await this.prisma.captain.findUnique({
      where: { userId },
      select: {
        id: true,
        profileImage: true,
        gender: true,
        dateOfBirth: true,
        isVerified: true,
        isOnline: true,
        rating: true,
        totalTrips: true,
        verifiedAt: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        safetyAlertEnabled: true,
        notifyRequestAlerts: true,
        shareLiveLocation: true,
        user: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        vehicle: {
          select: {
            brand: true,
            model: true,
            color: true,
            vehicleNumber: true,
            vehicleType: true,
          },
        },
      },
    });

    if (!captain) throw new NotFoundException('Captain profile not found');

    return {
      name: captain.user.fullName,
      email: captain.user.email,
      phoneNumber: captain.user.phoneNumber,
      profileImage: captain.profileImage,
      gender: captain.gender,
      dateOfBirth: captain.dateOfBirth,
      isVerified: captain.isVerified,
      isOnline: captain.isOnline,
      rating: captain.rating,
      totalTrips: captain.totalTrips,
      verifiedAt: captain.verifiedAt,
      vehicle: captain.vehicle
        ? `${captain.vehicle.brand} ${captain.vehicle.model}`
        : '—',
      plateNumber: captain.vehicle?.vehicleNumber ?? '—',
      vehicleType: captain.vehicle?.vehicleType ?? null,
      vehicleColor: captain.vehicle?.color ?? null,
      emergencyContactName: captain.emergencyContactName,
      emergencyContactPhone: captain.emergencyContactPhone,
      safetyAlertEnabled: captain.safetyAlertEnabled,
      notifyRequestAlerts: captain.notifyRequestAlerts,
      shareLiveLocation: captain.shareLiveLocation,
    };
  }

  async setOnlineStatus(userId: string, isOnline: boolean) {
    const captain = await this.prisma.captain.findUnique({
      where: { userId },
      include: { vehicle: true },
    });

    if (!captain) throw new NotFoundException('Captain profile not found');

    if (isOnline) {
      await this.verificationService.assertCanGoOnline(userId);
    }

    await this.prisma.captain.update({
      where: { id: captain.id },
      data: { isOnline },
    });

    if (captain.vehicle) {
      await this.rideRedis.setCaptainOnline(
        captain.id,
        userId,
        captain.currentLatitude,
        captain.currentLongitude,
        captain.vehicle.vehicleType,
        isOnline,
      );
    }

    return { isOnline };
  }

  async updateProfile(userId: string, dto: UpdateCaptainProfileDto) {
    const captain = await this.prisma.captain.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!captain) throw new NotFoundException('Captain profile not found');

    const { fullName, name, ...captainFields } = dto;
    const resolvedFullName = fullName ?? name;

    await this.prisma.$transaction([
      ...(resolvedFullName
        ? [
            this.prisma.user.update({
              where: { id: userId },
              data: { fullName: resolvedFullName },
            }),
          ]
        : []),
      this.prisma.captain.update({
        where: { id: captain.id },
        data: {
          ...captainFields,
          dateOfBirth: captainFields.dateOfBirth
            ? new Date(captainFields.dateOfBirth)
            : undefined,
        },
      }),
    ]);

    return this.getProfile(userId);
  }

  async createSupportInquiry(
    userId: string,
    dto: { subject: string; description: string; category?: string },
  ) {
    const captain = await this.prisma.captain.findUnique({
      where: { userId },
      select: { id: true, user: { select: { fullName: true, phoneNumber: true } } },
    });
    if (!captain) throw new NotFoundException('Captain profile not found');

    return this.prisma.auditLog.create({
      data: {
        performedBy: userId,
        action: AuditAction.INCIDENT_CREATED,
        channel: 'CAPTAIN_SUPPORT',
        metadata: {
          captainId: captain.id,
          captainName: captain.user.fullName,
          phone: captain.user.phoneNumber,
          subject: dto.subject,
          description: dto.description,
          category: dto.category ?? 'OTHER',
        },
      },
    });
  }

  private getWeeklyMap(
    startOfWeek: Date,
    rides: { finalFare: number | null; completedAt: Date }[],
  ) {
    const earningsByDay = new Map<string, number>();
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      earningsByDay.set(key, 0);
    }

    rides.forEach((ride) => {
      const key = ride.completedAt.toISOString().slice(0, 10);
      earningsByDay.set(
        key,
        (earningsByDay.get(key) ?? 0) + (ride.finalFare ?? 0),
      );
    });

    return Array.from(earningsByDay.entries()).map(([key, amount]) => {
      const date = new Date(key);
      return {
        day: formatter.format(date),
        amount,
      };
    });
  }

  private getPeakHour(rides: { completedAt: Date }[]) {
    if (rides.length === 0) return 'N/A';

    const hourCounts = rides.reduce(
      (acc, ride) => {
        const hour = ride.completedAt.getHours();
        acc[hour] = (acc[hour] ?? 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const peakHour = Object.entries(hourCounts).reduce(
      (best, [hour, count]) =>
        count > best.count ? { hour: Number(hour), count } : best,
      { hour: 0, count: 0 },
    ).hour;

    return `${peakHour}:00 - ${peakHour + 1}:00`;
  }
}
