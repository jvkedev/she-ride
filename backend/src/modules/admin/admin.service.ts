import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  RideStatus,
  AccountStatus,
  DocumentStatus,
  UserRole,
} from '@prisma/client';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  // ── Dashboard ────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRiders,
      totalCaptains,
      totalRides,
      completedRides,
      cancelledRides,
      activeRides,
      pendingKyc,
      totalRevenueAgg,
      revenueThisMonthAgg,
      revenueLastMonthAgg,
      newRidersThisMonth,
      newCaptainsThisMonth,
      ridesThisMonth,
      ridesToday,
      onlineCaptains,
    ] = await Promise.all([
      // Counts
      this.prisma.user.count({ where: { role: 'RIDER' } }),
      this.prisma.user.count({ where: { role: 'CAPTAIN' } }),
      this.prisma.ride.count(),
      this.prisma.ride.count({ where: { status: RideStatus.COMPLETED } }),
      this.prisma.ride.count({ where: { status: RideStatus.CANCELED } }),
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

      // Pending KYC captains
      this.prisma.captainDocument.count({
        where: { documentStatus: DocumentStatus.PENDING },
      }),

      // Revenue (sum of finalFare on completed rides)
      this.prisma.ride.aggregate({
        _sum: { finalFare: true },
        where: { status: RideStatus.COMPLETED },
      }),
      this.prisma.ride.aggregate({
        _sum: { finalFare: true },
        where: {
          status: RideStatus.COMPLETED,
          completedAt: { gte: startOfMonth },
        },
      }),
      this.prisma.ride.aggregate({
        _sum: { finalFare: true },
        where: {
          status: RideStatus.COMPLETED,
          completedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),

      // Growth counts
      this.prisma.user.count({
        where: { role: 'RIDER', createdAt: { gte: startOfMonth } },
      }),
      this.prisma.user.count({
        where: { role: 'CAPTAIN', createdAt: { gte: startOfMonth } },
      }),
      this.prisma.ride.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.ride.count({ where: { createdAt: { gte: startOfToday } } }),

      // Online captains
      this.prisma.captain.count({ where: { isOnline: true } }),
    ]);

    const totalRevenue = totalRevenueAgg._sum.finalFare ?? 0;
    const revenueThisMonth = revenueThisMonthAgg._sum.finalFare ?? 0;
    const revenueLastMonth = revenueLastMonthAgg._sum.finalFare ?? 0;

    const revenueGrowth =
      revenueLastMonth > 0
        ? (
            ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) *
            100
          ).toFixed(1)
        : null;

    const completionRate =
      totalRides > 0 ? ((completedRides / totalRides) * 100).toFixed(1) : '0.0';

    return {
      overview: {
        totalRiders,
        totalCaptains,
        totalRides,
        totalRevenue: +totalRevenue.toFixed(2),
        onlineCaptains,
        activeRides,
        pendingKyc,
      },
      thisMonth: {
        newRiders: newRidersThisMonth,
        newCaptains: newCaptainsThisMonth,
        rides: ridesThisMonth,
        revenue: +revenueThisMonth.toFixed(2),
        revenueGrowthPercent: revenueGrowth ? +revenueGrowth : null,
      },
      today: {
        rides: ridesToday,
      },
      rates: {
        completionRate: +completionRate,
        cancellationRate:
          totalRides > 0
            ? +((cancelledRides / totalRides) * 100).toFixed(1)
            : 0,
      },
    };
  }

  // ── Revenue chart — last 6 months ────────────────────────────────────────

  async getRevenueChart() {
    const months: { label: string; revenue: number; rides: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
      );

      const [agg, count] = await Promise.all([
        this.prisma.ride.aggregate({
          _sum: { finalFare: true },
          where: {
            status: RideStatus.COMPLETED,
            completedAt: { gte: start, lte: end },
          },
        }),
        this.prisma.ride.count({
          where: {
            status: RideStatus.COMPLETED,
            completedAt: { gte: start, lte: end },
          },
        }),
      ]);

      months.push({
        label: start.toLocaleString('en-IN', {
          month: 'short',
          year: '2-digit',
        }),
        revenue: +(agg._sum.finalFare ?? 0).toFixed(2),
        rides: count,
      });
    }

    return months;
  }

  // ── Rides per day — last 7 days ──────────────────────────────────────────

  async getRideTrends() {
    const days: {
      label: string;
      total: number;
      completed: number;
      cancelled: number;
    }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i,
      );
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i + 1,
      );

      const [total, completed, cancelled] = await Promise.all([
        this.prisma.ride.count({
          where: { createdAt: { gte: start, lt: end } },
        }),
        this.prisma.ride.count({
          where: {
            status: RideStatus.COMPLETED,
            createdAt: { gte: start, lt: end },
          },
        }),
        this.prisma.ride.count({
          where: {
            status: RideStatus.CANCELED,
            createdAt: { gte: start, lt: end },
          },
        }),
      ]);

      days.push({
        label: start.toLocaleString('en-IN', { weekday: 'short' }),
        total,
        completed,
        cancelled,
      });
    }

    return days;
  }

  // ── Recent rides ─────────────────────────────────────────────────────────

  async getRecentRides(limit = 10) {
    const rides = await this.prisma.ride.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        rider: { include: { user: { select: { fullName: true } } } },
        captain: { include: { user: { select: { fullName: true } } } },
      },
    });

    return rides.map((ride) => ({
      id: ride.id,
      riderName: ride.rider.user.fullName,
      captainName: ride.captain?.user.fullName ?? null,
      pickup: ride.pickupAddress,
      dropoff: ride.dropAddress,
      fare: ride.finalFare ?? ride.estimatedFare ?? 0,
      distance: ride.distanceInKm ? `${ride.distanceInKm.toFixed(1)} km` : '—',
      status: ride.status.toLowerCase(),
      vehicleType: ride.vehicleType,
      paymentMethod: ride.paymentMethod,
      createdAt: ride.createdAt,
    }));
  }

  // ── Recent activity feed ─────────────────────────────────────────────────

  async getActivityFeed(limit = 15) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days

    const [recentRides, recentRiders, recentCaptains, recentKyc] =
      await Promise.all([
        this.prisma.ride.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          where: { createdAt: { gte: since } },
          include: {
            rider: { include: { user: { select: { fullName: true } } } },
          },
        }),
        this.prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          where: { role: 'RIDER', createdAt: { gte: since } },
          select: { fullName: true, createdAt: true },
        }),
        this.prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          where: { role: 'CAPTAIN', createdAt: { gte: since } },
          select: { fullName: true, createdAt: true },
        }),
        this.prisma.captainDocument.findMany({
          take: 5,
          orderBy: { updatedAt: 'desc' },
          where: { updatedAt: { gte: since } },
          include: {
            captain: { include: { user: { select: { fullName: true } } } },
          },
        }),
      ]);

    const activities: {
      id: string;
      message: string;
      time: Date;
      type: 'ride' | 'rider' | 'captain' | 'kyc';
    }[] = [];

    recentRides.forEach((r) => {
      activities.push({
        id: `ride-${r.id}`,
        message: `New ride booked by ${r.rider.user.fullName}`,
        time: r.createdAt,
        type: 'ride',
      });
    });

    recentRiders.forEach((r) => {
      activities.push({
        id: `rider-${r.fullName}-${r.createdAt.getTime()}`,
        message: `New rider registered: ${r.fullName}`,
        time: r.createdAt,
        type: 'rider',
      });
    });

    recentCaptains.forEach((c) => {
      activities.push({
        id: `captain-${c.fullName}-${c.createdAt.getTime()}`,
        message: `New captain registered: ${c.fullName}`,
        time: c.createdAt,
        type: 'captain',
      });
    });

    recentKyc.forEach((doc) => {
      const statusLabel =
        doc.documentStatus === DocumentStatus.APPROVED
          ? 'approved'
          : doc.documentStatus === DocumentStatus.REJECTED
            ? 'rejected'
            : 'submitted';
      activities.push({
        id: `kyc-${doc.id}`,
        message: `KYC ${statusLabel} for ${doc.captain.user.fullName}`,
        time: doc.updatedAt,
        type: 'kyc',
      });
    });

    // Sort by most recent and return top `limit`
    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, limit)
      .map((a) => ({ ...a, time: a.time.toISOString() }));
  }

  // ── Riders list ──────────────────────────────────────────────────────────

  async getRiders() {
    const users = await this.prisma.user.findMany({
      where: { role: 'RIDER' },
      orderBy: { createdAt: 'desc' },
      include: {
        rider: {
          select: {
            totalRides: true,
            averageRating: true,
          },
        },
      },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      phone: u.phoneNumber,
      totalRides: u.rider?.totalRides ?? 0,
      rating: u.rider?.averageRating ?? 5,
      status: u.accountStatus.toLowerCase(),
      joinedAt: u.createdAt,
    }));
  }

  // ── Block / Unblock rider ────────────────────────────────────────────────

  async blockRider(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { accountStatus: AccountStatus.BLOCKED },
    });
    return { success: true, message: 'Rider blocked successfully' };
  }

  async unblockRider(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { accountStatus: AccountStatus.ACTIVE },
    });
    return { success: true, message: 'Rider unblocked successfully' };
  }

  // ── Captains/Drivers list ────────────────────────────────────────────────

  async getCaptains() {
    const captains = await this.prisma.captain.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            phoneNumber: true,
            accountStatus: true,
          },
        },
        vehicle: {
          select: {
            vehicleType: true,
            vehicleNumber: true,
            brand: true,
            model: true,
          },
        },
        document: {
          select: {
            documentStatus: true,
          },
        },
      },
    });

    return captains.map((captain) => ({
      id: captain.id,
      name: captain.user.fullName,
      phone: captain.user.phoneNumber,
      vehicle: captain.vehicle
        ? `${captain.vehicle.brand} ${captain.vehicle.model}`
        : 'N/A',
      vehicleType: captain.vehicle?.vehicleType ?? 'AUTO',
      plate: captain.vehicle?.vehicleNumber ?? '—',
      rating: captain.rating,
      trips: captain.totalTrips,
      status: captain.isOnline
        ? 'online'
        : captain.user.accountStatus.toLowerCase(),
      kycStatus: captain.document?.documentStatus.toLowerCase() ?? 'pending',
      joinedAt: captain.createdAt,
    }));
  }

  async getCaptainById(captainId: string) {
    const captain = await this.prisma.captain.findUnique({
      where: { id: captainId },
      include: {
        user: {
          select: {
            fullName: true,
            phoneNumber: true,
            accountStatus: true,
            email: true,
            createdAt: true,
          },
        },
        vehicle: {
          select: {
            vehicleType: true,
            vehicleNumber: true,
            brand: true,
            model: true,
          },
        },
        document: {
          select: {
            documentStatus: true,
            rejectionReason: true,
            aadhaarNumber: true,
            drivingLicenseNumber: true,
            aadhaarFrontImage: true,
            aadhaarBackImage: true,
            drivingLicenseImage: true,
            rcImage: true,
            selfieImage: true,
            uploadedAt: true,
            verifiedAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!captain) {
      return null;
    }

    return {
      id: captain.id,
      name: captain.user.fullName,
      email: captain.user.email,
      phone: captain.user.phoneNumber,
      vehicle: captain.vehicle
        ? `${captain.vehicle.brand} ${captain.vehicle.model}`
        : 'N/A',
      vehicleType: captain.vehicle?.vehicleType ?? 'AUTO',
      plate: captain.vehicle?.vehicleNumber ?? '—',
      rating: captain.rating,
      trips: captain.totalTrips,
      status: captain.isOnline
        ? 'online'
        : captain.user.accountStatus.toLowerCase(),
      documentStatus:
        captain.document?.documentStatus.toLowerCase() ?? 'pending',
      rejectionReason: captain.document?.rejectionReason ?? null,
      joinedAt: captain.createdAt,
      documents: [
        {
          key: 'driving_license',
          label: 'Driving license',
          number: captain.document?.drivingLicenseNumber ?? null,
          imageUrl: captain.document?.drivingLicenseImage ?? null,
          status: captain.document?.documentStatus.toLowerCase() ?? 'pending',
        },
        {
          key: 'rc_registration',
          label: 'RC / Registration',
          number: captain.vehicle?.vehicleNumber ?? null,
          imageUrl: captain.document?.rcImage ?? null,
          status: captain.document?.documentStatus.toLowerCase() ?? 'pending',
        },
        {
          key: 'aadhaar',
          label: 'Aadhaar',
          number: captain.document?.aadhaarNumber ?? null,
          imageUrl: captain.document?.aadhaarFrontImage ?? null,
          status: captain.document?.documentStatus.toLowerCase() ?? 'pending',
        },
        {
          key: 'selfie',
          label: 'Selfie verification',
          number: null,
          imageUrl: captain.document?.selfieImage ?? null,
          status: captain.document?.documentStatus.toLowerCase() ?? 'pending',
        },
      ],
    };
  }

  async updateCaptainDocument(
    captainId: string,
    dto: { status: DocumentStatus; rejectionReason?: string },
  ) {
    const captain = await this.prisma.captain.findUnique({
      where: { id: captainId },
      include: {
        user: {
          select: {
            fullName: true,
            phoneNumber: true,
            accountStatus: true,
            email: true,
            createdAt: true,
          },
        },
        vehicle: {
          select: {
            vehicleType: true,
            vehicleNumber: true,
            brand: true,
            model: true,
          },
        },
        document: true,
      },
    });

    if (!captain || !captain.document) {
      return null;
    }

    await this.prisma.captainDocument.update({
      where: { captainId },
      data: {
        documentStatus: dto.status,
        rejectionReason:
          dto.status === DocumentStatus.REJECTED
            ? (dto.rejectionReason ?? 'Document rejected by security review')
            : null,
        verifiedAt:
          dto.status === DocumentStatus.APPROVED
            ? new Date()
            : captain.document.verifiedAt,
      },
    });

    return this.getCaptainById(captainId);
  }

  private async ensureAdminProfile(userId: string) {
    const existing = await this.prisma.admin.findUnique({ where: { userId } });
    if (existing) {
      return existing;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      throw new NotFoundException('Admin profile not found');
    }

    return this.prisma.admin.create({ data: { userId } });
  }

  async getProfile(userId: string) {
    await this.ensureAdminProfile(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { admin: true },
    });

    if (!user?.admin) {
      throw new NotFoundException('Admin profile not found');
    }

    return {
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImage: user.admin.profileImage,
      gender: user.admin.gender,
      dateOfBirth: user.admin.dateOfBirth?.toISOString() ?? null,
      department: user.admin.department,
      jobTitle: user.admin.jobTitle,
      memberSince: user.createdAt.toISOString(),
    };
  }

  async updateProfile(
    userId: string,
    dto: {
      fullName?: string;
      email?: string;
      gender?: 'MALE' | 'FEMALE' | 'OTHER';
      dateOfBirth?: string;
      department?: string;
      jobTitle?: string;
    },
  ) {
    await this.ensureAdminProfile(userId);

    await this.prisma.$transaction([
      ...(dto.fullName || dto.email
        ? [
            this.prisma.user.update({
              where: { id: userId },
              data: {
                ...(dto.fullName && { fullName: dto.fullName }),
                ...(dto.email && { email: dto.email }),
              },
            }),
          ]
        : []),
      this.prisma.admin.update({
        where: { userId },
        data: {
          ...(dto.gender && { gender: dto.gender }),
          ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
          ...(dto.department !== undefined && { department: dto.department }),
          ...(dto.jobTitle !== undefined && { jobTitle: dto.jobTitle }),
        },
      }),
    ]);

    return this.getProfile(userId);
  }

  async updateProfilePhoto(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ profileImage: string }> {
    const admin = await this.ensureAdminProfile(userId);

    if (admin.profileImage) {
      const publicId = this.extractPublicId(admin.profileImage);
      if (publicId) {
        await this.cloudinary.deleteImage(publicId);
      }
    }

    const url = await this.cloudinary.uploadImage(file, 'she-ride/admins');

    await this.prisma.admin.update({
      where: { userId },
      data: { profileImage: url },
    });

    return { profileImage: url };
  }

  private extractPublicId(url: string): string | null {
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;
      const withVersion = parts[1];
      const withoutVersion = withVersion.replace(/^v\d+\//, '');
      return withoutVersion.replace(/\.[^.]+$/, '');
    } catch {
      return null;
    }
  }

  // ── All Rides list ──────────────────────────────────────────────────────

  async getAllRides() {
    const rides = await this.prisma.ride.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        rider: { include: { user: { select: { fullName: true } } } },
        captain: { include: { user: { select: { fullName: true } } } },
      },
    });

    return rides.map((ride) => ({
      id: ride.id,
      riderName: ride.rider.user.fullName,
      driverName: ride.captain?.user.fullName ?? 'Unassigned',
      pickup: ride.pickupAddress,
      dropoff: ride.dropAddress,
      fare: ride.finalFare ?? ride.estimatedFare ?? 0,
      distance: ride.distanceInKm ? `${ride.distanceInKm.toFixed(1)} km` : '—',
      status: ride.status.toLowerCase(),
      createdAt: ride.createdAt,
    }));
  }

  // ── Payments ───────────────────────────────────────────────────────────

  async getPayments() {
    const payments = await this.prisma.ride.findMany({
      where: { status: RideStatus.COMPLETED },
      orderBy: { completedAt: 'desc' },
      include: {
        rider: { include: { user: { select: { fullName: true } } } },
        captain: { include: { user: { select: { fullName: true } } } },
      },
    });

    return payments.map((ride) => ({
      id: ride.id,
      rideId: ride.id,
      riderName: ride.rider.user.fullName,
      driverName: ride.captain?.user.fullName ?? 'Unassigned',
      tripAmount: ride.finalFare ?? ride.estimatedFare ?? 0,
      paymentMethod: ride.paymentMethod.toLowerCase(),
      completedAt:
        ride.completedAt?.toISOString() ?? ride.createdAt.toISOString(),
      status: 'completed',
      pickup: ride.pickupAddress,
      dropoff: ride.dropAddress,
    }));
  }

  async getPaymentsTrend() {
    const days: {
      label: string;
      tripAmount: number;
      trips: number;
    }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i,
      );
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i + 1,
      );

      const [agg, count] = await Promise.all([
        this.prisma.ride.aggregate({
          _sum: { finalFare: true },
          where: {
            status: RideStatus.COMPLETED,
            completedAt: { gte: start, lt: end },
          },
        }),
        this.prisma.ride.count({
          where: {
            status: RideStatus.COMPLETED,
            completedAt: { gte: start, lt: end },
          },
        }),
      ]);

      days.push({
        label: start.toLocaleString('en-IN', { weekday: 'short' }),
        tripAmount: +(agg._sum.finalFare ?? 0).toFixed(2),
        trips: count,
      });
    }

    return days;
  }
}
