import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  RideStatus,
  AccountStatus,
  DocumentStatus,
  UserRole,
  CaptainReportStatus,
  SupportTicketStatus,
  VehicleType,
  Gender,
} from '@prisma/client';
import { RideRedisService } from '../redis/ride-redis.service';
import { FareConfigService, type FareRatesMap } from '../platform/fare-config.service';
import {
  AdminDepartment,
  AdminJobTitle,
  AdminPermissionRole,
} from '@prisma/client';
import {
  formatDepartmentLabel,
  formatJobTitleLabel,
  formatPermissionRoleLabel,
  getOrgOptions,
} from './admin-org.constants';
import { UpdateAdminProfileDto } from './dto/update-admin-profile.dto';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { CaptainVerificationService } from '../captain/captain-verification.service';
import { computeKycStatus } from '../captain/captain-verification.constants';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private rideRedis: RideRedisService,
    private fareConfig: FareConfigService,
    private verificationService: CaptainVerificationService,
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
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const [
      totalRiders,
      totalCaptains,
      totalRides,
      completedRides,
      cancelledRides,
      activeRides,
      pendingKyc,
      approvedKyc,
      rejectedKyc,
      pendingReports,
      openSupportTickets,
      totalRevenueAgg,
      revenueTodayAgg,
      revenueThisWeekAgg,
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

      // Pending KYC captains (at least one document awaiting review)
      this.prisma.captain.count({
        where: {
          document: {
            items: {
              some: { verificationStatus: 'PENDING_REVIEW' },
            },
          },
        },
      }),

      this.prisma.captain.count({
        where: { isVerified: true },
      }),

      this.prisma.captain.count({
        where: {
          isVerified: false,
          document: {
            items: {
              some: { verificationStatus: 'REJECTED' },
            },
          },
        },
      }),

      this.prisma.captainReport.count({
        where: {
          status: {
            in: [CaptainReportStatus.OPEN, CaptainReportStatus.UNDER_REVIEW],
          },
        },
      }),

      this.prisma.supportTicket.count({
        where: {
          status: {
            in: [SupportTicketStatus.OPEN, SupportTicketStatus.IN_PROGRESS],
          },
        },
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
          completedAt: { gte: startOfToday },
        },
      }),
      this.prisma.ride.aggregate({
        _sum: { finalFare: true },
        where: {
          status: RideStatus.COMPLETED,
          completedAt: { gte: startOfWeek },
        },
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
    const revenueToday = revenueTodayAgg._sum.finalFare ?? 0;
    const revenueThisWeek = revenueThisWeekAgg._sum.finalFare ?? 0;
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
        completedRides,
        cancelledRides,
        totalRevenue: +totalRevenue.toFixed(2),
        revenueToday: +revenueToday.toFixed(2),
        revenueThisWeek: +revenueThisWeek.toFixed(2),
        revenueThisMonth: +revenueThisMonth.toFixed(2),
        onlineCaptains,
        activeRides,
        pendingKyc,
        approvedKyc,
        rejectedKyc,
        pendingReports,
        openSupportTickets,
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
        revenue: +revenueToday.toFixed(2),
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

  async getRiderById(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, role: 'RIDER' },
      include: {
        rider: {
          include: {
            captainReports: {
              take: 10,
              orderBy: { createdAt: 'desc' },
              include: {
                captain: { include: { user: { select: { fullName: true } } } },
                ride: {
                  select: {
                    pickupAddress: true,
                    dropAddress: true,
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user?.rider) {
      return null;
    }

    const rides = await this.prisma.ride.findMany({
      where: { riderId: user.rider.id },
      orderBy: { createdAt: 'desc' },
      take: 15,
      include: {
        captain: { include: { user: { select: { fullName: true } } } },
      },
    });

    const payments = rides
      .filter((r) => r.status === RideStatus.COMPLETED)
      .map((ride) => ({
        id: ride.id,
        amount: ride.finalFare ?? ride.estimatedFare ?? 0,
        method: ride.paymentMethod.toLowerCase(),
        completedAt: ride.completedAt?.toISOString() ?? ride.createdAt.toISOString(),
        pickup: ride.pickupAddress,
        dropoff: ride.dropAddress,
      }));

    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phoneNumber,
      totalRides: user.rider.totalRides,
      rating: user.rider.averageRating,
      status: user.accountStatus.toLowerCase(),
      joinedAt: user.createdAt.toISOString(),
      recentRides: rides.map((ride) => ({
        id: ride.id,
        driverName: ride.captain?.user.fullName ?? 'Unassigned',
        pickup: ride.pickupAddress,
        dropoff: ride.dropAddress,
        fare: ride.finalFare ?? ride.estimatedFare ?? 0,
        status: ride.status.toLowerCase(),
        createdAt: ride.createdAt.toISOString(),
      })),
      payments,
      reports: user.rider.captainReports.map((report) => ({
        id: report.id,
        category: report.category,
        status: report.status,
        description: report.description,
        captainName: report.captain.user.fullName,
        ride: report.ride,
        createdAt: report.createdAt.toISOString(),
      })),
    };
  }

  async blockCaptain(captainId: string) {
    const captain = await this.prisma.captain.findUnique({
      where: { id: captainId },
      select: { userId: true },
    });
    if (!captain) {
      throw new NotFoundException('Captain not found');
    }

    await this.prisma.user.update({
      where: { id: captain.userId },
      data: { accountStatus: AccountStatus.BLOCKED },
    });

    await this.prisma.captain.update({
      where: { id: captainId },
      data: { isOnline: false },
    });

    return { success: true, message: 'Captain blocked successfully' };
  }

  async unblockCaptain(captainId: string) {
    const captain = await this.prisma.captain.findUnique({
      where: { id: captainId },
      select: { userId: true },
    });
    if (!captain) {
      throw new NotFoundException('Captain not found');
    }

    await this.prisma.user.update({
      where: { id: captain.userId },
      data: { accountStatus: AccountStatus.ACTIVE },
    });

    return { success: true, message: 'Captain unblocked successfully' };
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
          include: {
            items: true,
          },
        },
      },
    });

    return captains.map((captain) => {
      const items = captain.document?.items ?? [];
      return {
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
        kycStatus: computeKycStatus(items, captain.isVerified),
        joinedAt: captain.createdAt,
      };
    });
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
          include: {
            items: true,
          },
        },
      },
    });

    if (!captain) {
      return null;
    }

    await this.verificationService.ensureDocumentBundle(captain.id);

    const refreshed = await this.prisma.captain.findUnique({
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
          include: { items: true },
        },
      },
    });

    if (!refreshed) return null;

    const documentItems = refreshed.document?.items ?? [];

    return {
      id: refreshed.id,
      name: refreshed.user.fullName,
      email: refreshed.user.email,
      phone: refreshed.user.phoneNumber,
      vehicle: refreshed.vehicle
        ? `${refreshed.vehicle.brand} ${refreshed.vehicle.model}`
        : 'N/A',
      vehicleType: refreshed.vehicle?.vehicleType ?? 'AUTO',
      plate: refreshed.vehicle?.vehicleNumber ?? '—',
      rating: refreshed.rating,
      trips: refreshed.totalTrips,
      status: refreshed.isOnline
        ? 'online'
        : refreshed.user.accountStatus.toLowerCase(),
      documentStatus: computeKycStatus(documentItems, refreshed.isVerified),
      rejectionReason:
        documentItems.find((i) => i.rejectionReason)?.rejectionReason ?? null,
      joinedAt: refreshed.createdAt,
      documents: this.verificationService.mapItemsForAdmin(documentItems),
    };
  }

  async updateCaptainDocument(
    captainId: string,
    dto: {
      status: DocumentStatus;
      documentKey: string;
      rejectionReason?: string;
    },
    reviewerUserId: string,
  ) {
    const captain = await this.prisma.captain.findUnique({
      where: { id: captainId },
      select: { id: true },
    });

    if (!captain) {
      return null;
    }

    await this.verificationService.ensureDocumentBundle(captainId);
    await this.verificationService.reviewDocument(
      captainId,
      dto.documentKey,
      dto.status,
      reviewerUserId,
      dto.rejectionReason,
    );

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

    return this.prisma.admin.create({
      data: {
        userId,
        department: AdminDepartment.OPERATIONS,
        jobTitle: AdminJobTitle.ADMINISTRATOR,
        permissionRole: AdminPermissionRole.ADMIN,
      },
    });
  }

  getOrganizationOptions() {
    return getOrgOptions();
  }

  private mapAdminProfile(user: {
    fullName: string;
    email: string;
    phoneNumber: string;
    admin: {
      profileImage: string | null;
      gender: Gender | null;
      dateOfBirth: Date | null;
      department: AdminDepartment | null;
      jobTitle: AdminJobTitle | null;
      permissionRole: AdminPermissionRole;
    };
  }) {
    return {
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImage: user.admin.profileImage,
      gender: user.admin.gender,
      dateOfBirth: user.admin.dateOfBirth?.toISOString() ?? null,
      department: user.admin.department,
      departmentLabel: formatDepartmentLabel(user.admin.department),
      jobTitle: user.admin.jobTitle,
      jobTitleLabel: formatJobTitleLabel(user.admin.jobTitle),
      permissionRole: user.admin.permissionRole,
      permissionRoleLabel: formatPermissionRoleLabel(
        user.admin.permissionRole,
      ),
    };
  }

  async getProfile(userId: string) {
    await this.ensureAdminProfile(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { admin: true },
    });

    const admin = user?.admin;
    if (!user || !admin) {
      throw new NotFoundException('Admin profile not found');
    }

    return this.mapAdminProfile({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      admin,
    });
  }

  async updateProfile(userId: string, dto: UpdateAdminProfileDto) {
    await this.ensureAdminProfile(userId);

    const userUpdates: {
      fullName?: string;
      email?: string;
      phoneNumber?: string;
    } = {};

    if (dto.fullName) userUpdates.fullName = dto.fullName;
    if (dto.email) userUpdates.email = dto.email;
    if (dto.phoneNumber) userUpdates.phoneNumber = dto.phoneNumber;

    const adminUpdates: {
      gender?: Gender;
      dateOfBirth?: Date;
      department?: AdminDepartment | null;
      jobTitle?: AdminJobTitle | null;
    } = {};

    if (dto.gender) adminUpdates.gender = dto.gender;
    if (dto.dateOfBirth) adminUpdates.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.department !== undefined) adminUpdates.department = dto.department;
    if (dto.jobTitle !== undefined) adminUpdates.jobTitle = dto.jobTitle;

    await this.prisma.$transaction([
      ...(Object.keys(userUpdates).length
        ? [
            this.prisma.user.update({
              where: { id: userId },
              data: userUpdates,
            }),
          ]
        : []),
      this.prisma.admin.update({
        where: { userId },
        data: adminUpdates,
      }),
    ]);

    return this.getProfile(userId);
  }

  async listAdminTeam() {
    const admins = await this.prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            accountStatus: true,
          },
        },
      },
    });

    return admins.map((row) => ({
      id: row.id,
      userId: row.userId,
      name: row.user.fullName,
      email: row.user.email,
      phone: row.user.phoneNumber,
      authRole: row.user.role,
      status: row.user.accountStatus.toLowerCase(),
      department: row.department,
      departmentLabel: formatDepartmentLabel(row.department),
      jobTitle: row.jobTitle,
      jobTitleLabel: formatJobTitleLabel(row.jobTitle),
      permissionRole: row.permissionRole,
      permissionRoleLabel: formatPermissionRoleLabel(row.permissionRole),
      profileImage: row.profileImage,
    }));
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

  async getGrowthChart() {
    const months: {
      label: string;
      riders: number;
      captains: number;
    }[] = [];
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

      const [riders, captains] = await Promise.all([
        this.prisma.user.count({
          where: { role: 'RIDER', createdAt: { gte: start, lte: end } },
        }),
        this.prisma.user.count({
          where: { role: 'CAPTAIN', createdAt: { gte: start, lte: end } },
        }),
      ]);

      months.push({
        label: start.toLocaleString('en-IN', {
          month: 'short',
          year: '2-digit',
        }),
        riders,
        captains,
      });
    }

    return months;
  }

  async getLiveOperations() {
    const activeStatuses = [
      RideStatus.SEARCHING,
      RideStatus.ACCEPTED,
      RideStatus.ARRIVING,
      RideStatus.IN_PROGRESS,
    ];

    const [activeRides, onlineCaptains, activeSosCount] = await Promise.all([
      this.prisma.ride.findMany({
        where: { status: { in: activeStatuses } },
        orderBy: { updatedAt: 'desc' },
        include: {
          rider: { include: { user: { select: { fullName: true, phoneNumber: true } } } },
          captain: {
            include: {
              user: { select: { fullName: true, phoneNumber: true } },
              vehicle: { select: { vehicleType: true, vehicleNumber: true } },
            },
          },
        },
      }),
      this.prisma.captain.findMany({
        where: { isOnline: true },
        include: {
          user: { select: { fullName: true } },
          vehicle: { select: { vehicleType: true, vehicleNumber: true } },
        },
      }),
      this.prisma.sosAlert.count({ where: { status: 'ACTIVE' } }),
    ]);

    const captainMarkers = await Promise.all(
      onlineCaptains.map(async (captain) => {
        const redisLoc = await this.rideRedis.getCaptainLocation(captain.id);
        const lat =
          redisLoc?.lat ??
          (captain.currentLatitude != null
            ? Number(captain.currentLatitude)
            : null);
        const lng =
          redisLoc?.lng ??
          (captain.currentLongitude != null
            ? Number(captain.currentLongitude)
            : null);

        return {
          id: captain.id,
          name: captain.user.fullName,
          vehicleType: captain.vehicle?.vehicleType ?? null,
          plate: captain.vehicle?.vehicleNumber ?? null,
          lat,
          lng,
          updatedAt: redisLoc?.updatedAt ?? null,
        };
      }),
    );

    const activeRidesWithLocations = await Promise.all(
      activeRides.map(async (ride) => {
        let captainLat: number | null = ride.captain?.currentLatitude ?? null;
        let captainLng: number | null = ride.captain?.currentLongitude ?? null;

        if (ride.captainId) {
          const redisLoc = await this.rideRedis.getCaptainLocation(ride.captainId);
          if (redisLoc?.lat != null && redisLoc?.lng != null) {
            captainLat = redisLoc.lat;
            captainLng = redisLoc.lng;
          }
        }

        return {
          id: ride.id,
          status: ride.status.toLowerCase(),
          riderName: ride.rider.user.fullName,
          riderPhone: ride.rider.user.phoneNumber,
          captainName: ride.captain?.user.fullName ?? null,
          captainPhone: ride.captain?.user.phoneNumber ?? null,
          captainId: ride.captainId,
          pickup: ride.pickupAddress,
          dropoff: ride.dropAddress,
          pickupLat: ride.pickupLatitude,
          pickupLng: ride.pickupLongitude,
          dropLat: ride.dropLatitude,
          dropLng: ride.dropLongitude,
          captainLat,
          captainLng,
          vehicleType: ride.captain?.vehicle?.vehicleType ?? ride.vehicleType,
        };
      }),
    );

    return {
      stats: {
        activeRides: activeRides.length,
        onlineCaptains: onlineCaptains.length,
        ridersOnTrip: activeRides.filter(
          (r) => r.status === RideStatus.IN_PROGRESS,
        ).length,
        activeSos: activeSosCount,
      },
      activeRides: activeRidesWithLocations,
      captains: captainMarkers.filter(
        (c) => c.lat != null && c.lng != null && Number.isFinite(c.lat),
      ),
    };
  }

  async getFareSettings() {
    const rates = await this.fareConfig.getRates();
    return Object.entries(rates).map(([vehicleType, rate]) => ({
      vehicleType,
      label: this.vehicleLabel(vehicleType as VehicleType),
      base: rate.base,
      perKm: rate.perKm,
    }));
  }

  async updateFareSettings(
    updates: Array<{ vehicleType: VehicleType; base: number; perKm: number }>,
  ) {
    const partial: Partial<FareRatesMap> = {};
    for (const row of updates) {
      partial[row.vehicleType] = { base: row.base, perKm: row.perKm };
    }
    const rates = await this.fareConfig.updateRates(partial);
    return Object.entries(rates).map(([vehicleType, rate]) => ({
      vehicleType,
      label: this.vehicleLabel(vehicleType as VehicleType),
      base: rate.base,
      perKm: rate.perKm,
    }));
  }

  async getRoleStats() {
    const roles: UserRole[] = [
      UserRole.ADMIN,
      UserRole.RIDER,
      UserRole.CAPTAIN,
      UserRole.SECURITY,
      UserRole.PENDING,
    ];

    const counts = await Promise.all(
      roles.map((role) =>
        this.prisma.user.count({ where: { role, accountStatus: AccountStatus.ACTIVE } }),
      ),
    );

    const descriptions: Record<UserRole, string> = {
      ADMIN: 'Full platform access, settings, and user management',
      RIDER: 'Book rides, payments, and safety features',
      CAPTAIN: 'Accept rides, earnings, and vehicle management',
      SECURITY: 'SOS, incidents, and safety operations',
      PENDING: 'Awaiting role selection after signup',
    };

    return roles.map((role, index) => ({
      role,
      name: role.charAt(0) + role.slice(1).toLowerCase(),
      users: counts[index],
      permissions: descriptions[role],
    }));
  }

  private vehicleLabel(type: VehicleType) {
    switch (type) {
      case VehicleType.BIKE:
        return 'She Bike';
      case VehicleType.AUTO:
        return 'She Auto';
      case VehicleType.CAR:
        return 'She Go';
      case VehicleType.SUV:
        return 'She Plus';
      default:
        return type;
    }
  }
}
