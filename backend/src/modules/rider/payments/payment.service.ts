// src/modules/rider/payments/payment.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  // GET default payment method for rider
  async getDefaultMethod(userId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
      select: { ridePreference: true }, // reuse existing field or add defaultPaymentMethod
    });
    if (!rider) throw new NotFoundException('Rider not found');

    // TODO: once you add defaultPaymentMethod to Rider model, return it here
    // For now return CASH as default
    return { method: 'CASH' };
  }

  // PATCH default payment method
  async setDefaultMethod(userId: string, method: 'CASH' | 'UPI') {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider not found');

    // TODO: once you add defaultPaymentMethod to Rider model, save it here
    // await this.prisma.rider.update({ where: { userId }, data: { defaultPaymentMethod: method } });

    return { method };
  }

  // GET last completed ride receipt
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
      },
    });

    if (!ride) return null;

    return {
      id: ride.id,
      pickupAddress: ride.pickupAddress,
      dropAddress: ride.dropAddress,
      fare: ride.finalFare ?? ride.estimatedFare ?? 0,
      method: ride.paymentMethod,
      status: ride.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
      completedAt: ride.completedAt,
    };
  }

  async getPaymentHistory(userId: string, limit = 10) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!rider) throw new NotFoundException('Rider not found');

    const rides = await this.prisma.ride.findMany({
      where: {
        riderId: rider.id,
        completedAt: { not: null },
      },
      orderBy: { completedAt: 'desc' },
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
    });

    return rides.map((ride) => ({
      id: ride.id,
      route: `${ride.pickupAddress} -> ${ride.dropAddress}`,
      pickupAddress: ride.pickupAddress,
      dropAddress: ride.dropAddress,
      fare: ride.finalFare ?? ride.estimatedFare ?? 0,
      method: ride.paymentMethod,
      status: ride.paymentStatus,
      completedAt: ride.completedAt,
    }));
  }
}
