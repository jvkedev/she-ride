import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentStatus, RideStatus } from '@prisma/client';
import { UpdateCaptainProfileDto } from './dto/update-captain-profile.dto';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CaptainService {
  constructor(private prisma: PrismaService) {}

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

  async getDocuments(captainId: string) {
    const document = await this.prisma.captainDocument.findUnique({
      where: { captainId },
      select: {
        documentStatus: true,
        aadhaarFrontImage: true,
        drivingLicenseImage: true,
        rcImage: true,
        selfieImage: true,
      },
    });

    // Map the single status to lowercase for the frontend
    const toStatus = (
      hasFile: boolean,
      overallStatus: DocumentStatus,
    ): 'verified' | 'pending' | 'rejected' => {
      if (!hasFile) return 'pending';
      if (overallStatus === DocumentStatus.APPROVED) return 'verified';
      if (overallStatus === DocumentStatus.REJECTED) return 'rejected';
      return 'pending';
    };

    const status = document?.documentStatus ?? DocumentStatus.PENDING;

    return [
      {
        name: 'Driving license',
        status: toStatus(!!document?.drivingLicenseImage, status),
      },
      {
        name: 'RC / Registration',
        status: toStatus(!!document?.rcImage, status),
      },
      {
        name: 'Aadhaar',
        status: toStatus(!!document?.aadhaarFrontImage, status),
      },
      {
        name: 'Selfie verification',
        status: toStatus(!!document?.selfieImage, status),
      },
    ];
  }

  async updateProfilePhoto(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ profileImage: string }> {
    // Upload buffer to Cloudinary
    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: 'captain-photos', resource_type: 'image' },
            (error, result) => {
              if (error || !result)
                reject(new Error(error?.message ?? 'Cloudinary upload failed'));
              else resolve(result);
            },
          )
          .end(file.buffer);
      },
    );

    const profileImage = result.secure_url;

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
    };
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
      // update fullName on User if provided
      ...(resolvedFullName
        ? [
            this.prisma.user.update({
              where: { id: userId },
              data: { fullName: resolvedFullName },
            }),
          ]
        : []),
      // update captain fields
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
