import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async getDefaultMethod(userId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
      select: { defaultPaymentMethod: true },
    });
    if (!rider) throw new NotFoundException('Rider not found');

    return { method: rider.defaultPaymentMethod };
  }

  async setDefaultMethod(userId: string, method: 'CASH' | 'UPI' | 'CARD') {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider not found');

    const mapped =
      method === 'UPI'
        ? PaymentMethod.UPI
        : method === 'CARD'
          ? PaymentMethod.CARD
          : PaymentMethod.CASH;

    await this.prisma.rider.update({
      where: { userId },
      data: { defaultPaymentMethod: mapped },
    });

    return { method: mapped };
  }

  async getLastRideReceipt(userId: string) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider not found');

    const ride = await this.prisma.ride.findFirst({
      where: { riderId: rider.id, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        pickupAddress: true,
        dropAddress: true,
        finalFare: true,
        estimatedFare: true,
        paymentMethod: true,
        paymentStatus: true,
        completedAt: true,
        distanceInKm: true,
      },
    });

    if (!ride) return null;

    return {
      id: ride.id,
      pickupAddress: ride.pickupAddress,
      dropAddress: ride.dropAddress,
      fare: ride.finalFare ?? ride.estimatedFare ?? 0,
      distanceInKm: ride.distanceInKm,
      method: ride.paymentMethod,
      status: ride.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
      completedAt: ride.completedAt,
    };
  }

  async getPaymentHistory(userId: string, page = 1, limit = 10) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!rider) throw new NotFoundException('Rider not found');

    const skip = (page - 1) * limit;

    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where: {
          riderId: rider.id,
          status: 'COMPLETED',
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          pickupAddress: true,
          dropAddress: true,
          estimatedFare: true,
          finalFare: true,
          paymentMethod: true,
          paymentStatus: true,
          completedAt: true,
        },
      }),
      this.prisma.ride.count({
        where: { riderId: rider.id, status: 'COMPLETED' },
      }),
    ]);

    return {
      data: rides.map((ride) => ({
        id: ride.id,
        route: `${ride.pickupAddress} → ${ride.dropAddress}`,
        pickupAddress: ride.pickupAddress,
        dropAddress: ride.dropAddress,
        fare: ride.finalFare ?? ride.estimatedFare ?? 0,
        method: ride.paymentMethod,
        status: ride.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
        completedAt: ride.completedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
