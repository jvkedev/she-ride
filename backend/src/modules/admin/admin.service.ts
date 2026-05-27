import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RideStatus, AccountStatus, DocumentStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ── Dashboard ────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
            in: [RideStatus.SEARCHING, RideStatus.ACCEPTED, RideStatus.ARRIVING, RideStatus.IN_PROGRESS],
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
        ? (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
        : null;

    const completionRate =
      totalRides > 0
        ? ((completedRides / totalRides) * 100).toFixed(1)
        : '0.0';

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
            ? +(((cancelledRides / totalRides) * 100).toFixed(1))
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
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

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
        label: start.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
        revenue: +(agg._sum.finalFare ?? 0).toFixed(2),
        rides: count,
      });
    }

    return months;
  }

  // ── Rides per day — last 7 days ──────────────────────────────────────────

  async getRideTrends() {
    const days: { label: string; total: number; completed: number; cancelled: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);

      const [total, completed, cancelled] = await Promise.all([
        this.prisma.ride.count({ where: { createdAt: { gte: start, lt: end } } }),
        this.prisma.ride.count({
          where: { status: RideStatus.COMPLETED, createdAt: { gte: start, lt: end } },
        }),
        this.prisma.ride.count({
          where: { status: RideStatus.CANCELED, createdAt: { gte: start, lt: end } },
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
}