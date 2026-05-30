import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CaptainReportCategory, RideStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCaptainReportDto } from './dto/create-captain-report.dto';

const REPORTABLE_STATUSES: RideStatus[] = [
  RideStatus.ACCEPTED,
  RideStatus.ARRIVING,
  RideStatus.IN_PROGRESS,
  RideStatus.COMPLETED,
  RideStatus.CANCELED,
];

@Injectable()
export class CaptainReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(userId: string, dto: CreateCaptainReportDto) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider profile not found');

    const ride = await this.prisma.ride.findUnique({
      where: { id: dto.rideId },
      include: { captain: true },
    });

    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.riderId !== rider.id) {
      throw new ForbiddenException('You can only report captains from your own rides');
    }
    if (!ride.captainId) {
      throw new BadRequestException('No captain assigned to this ride yet');
    }
    if (!REPORTABLE_STATUSES.includes(ride.status)) {
      throw new BadRequestException('This ride cannot be reported');
    }

    const existing = await this.prisma.captainReport.findUnique({
      where: {
        rideId_riderId: { rideId: dto.rideId, riderId: rider.id },
      },
    });
    if (existing) {
      throw new ConflictException(
        'You have already submitted a report for this ride',
      );
    }

    if (!Object.values(CaptainReportCategory).includes(dto.category)) {
      throw new BadRequestException('Invalid report category');
    }

    return this.prisma.captainReport.create({
      data: {
        rideId: dto.rideId,
        riderId: rider.id,
        captainId: ride.captainId,
        category: dto.category,
        description: dto.description?.trim() || null,
        imageUrl: dto.imageUrl || null,
      },
      include: {
        captain: {
          include: {
            user: { select: { fullName: true } },
            vehicle: true,
          },
        },
        ride: {
          select: {
            pickupAddress: true,
            dropAddress: true,
            status: true,
          },
        },
      },
    });
  }

  async getMyReports(userId: string) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider profile not found');

    return this.prisma.captainReport.findMany({
      where: { riderId: rider.id },
      orderBy: { createdAt: 'desc' },
      include: {
        captain: {
          include: { user: { select: { fullName: true } } },
        },
        ride: {
          select: {
            id: true,
            pickupAddress: true,
            dropAddress: true,
            completedAt: true,
          },
        },
      },
    });
  }

  async listForAdmin(status?: string) {
    return this.prisma.captainReport.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        rider: { include: { user: { select: { fullName: true, phoneNumber: true } } } },
        captain: { include: { user: { select: { fullName: true, phoneNumber: true } } } },
        ride: true,
      },
    });
  }

  async updateStatus(id: string, status: string, adminNote?: string) {
    const report = await this.prisma.captainReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');

    return this.prisma.captainReport.update({
      where: { id },
      data: {
        status: status as any,
        adminNote: adminNote ?? report.adminNote,
      },
    });
  }
}
