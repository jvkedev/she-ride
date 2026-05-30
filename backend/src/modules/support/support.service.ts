import { Injectable, NotFoundException } from '@nestjs/common';
import { SupportTicketCategory, SupportTicketStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(
    userId: string,
    dto: {
      category: SupportTicketCategory;
      subject: string;
      description: string;
      rideId?: string;
    },
  ) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider profile not found');

    if (dto.rideId) {
      const ride = await this.prisma.ride.findFirst({
        where: { id: dto.rideId, riderId: rider.id },
      });
      if (!ride) throw new NotFoundException('Ride not found');
    }

    return this.prisma.supportTicket.create({
      data: {
        riderId: rider.id,
        rideId: dto.rideId ?? null,
        category: dto.category,
        subject: dto.subject.trim(),
        description: dto.description.trim(),
      },
    });
  }

  async getMyTickets(userId: string) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider profile not found');

    return this.prisma.supportTicket.findMany({
      where: { riderId: rider.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTicket(userId: string, ticketId: string) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider profile not found');

    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, riderId: rider.id },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async listForAdmin(status?: string) {
    return this.prisma.supportTicket.findMany({
      where: status ? { status: status as SupportTicketStatus } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        rider: { include: { user: { select: { fullName: true, email: true, phoneNumber: true } } } },
        ride: { select: { id: true, pickupAddress: true, dropAddress: true, status: true } },
      },
    });
  }

  async getTicketForAdmin(ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        rider: { include: { user: { select: { fullName: true, email: true, phoneNumber: true } } } },
        ride: { select: { id: true, pickupAddress: true, dropAddress: true, status: true } },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async updateTicketForAdmin(
    ticketId: string,
    dto: { status?: SupportTicketStatus; adminResponse?: string },
  ) {
    await this.getTicketForAdmin(ticketId);

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.adminResponse !== undefined && {
          adminResponse: dto.adminResponse.trim() || null,
        }),
      },
      include: {
        rider: { include: { user: { select: { fullName: true, email: true, phoneNumber: true } } } },
        ride: { select: { id: true, pickupAddress: true, dropAddress: true, status: true } },
      },
    });
  }
}
