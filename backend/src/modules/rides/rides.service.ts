import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import {
  RideStatus,
  PaymentMethod,
  VehicleType,
  OtpType,
} from '@prisma/client';
import { CreateRideDto } from './dto/create-ride.dto';
import { haversineDistance } from './helpers/haversine.helper';
import { calculateFare } from './helpers/fare.helper';

@Injectable()
export class RidesService {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
  ) {}

  // ========================== Request Ride ==========================
  async requestRide(dto: CreateRideDto, userId: string) {
    // 1. Get rider profile
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
    });
    if (!rider) throw new BadRequestException('Rider profile not found');

    // 2. Check no active ride exists
    const activeRide = await this.prisma.ride.findFirst({
      where: {
        riderId: rider.id,
        status: {
          in: [
            RideStatus.SEARCHING,
            RideStatus.ACCEPTED,
            RideStatus.IN_PROGRESS,
          ],
        },
      },
    });
    if (activeRide)
      throw new BadRequestException('You already have an active ride');

    // 3. Calculate distance + fare
    const distanceKm = haversineDistance(
      dto.pickupLatitude,
      dto.pickupLongitude,
      dto.dropLatitude,
      dto.dropLongitude,
    );
    const estimatedFare = calculateFare(distanceKm, dto.vehicleType);

    // 4. Find nearby captains
    const nearbyCaptains = await this.findNearbyCaptains(
      dto.pickupLatitude,
      dto.pickupLongitude,
      dto.vehicleType,
      5,
    );

    // 5. Create ride
    const ride = await this.prisma.ride.create({
      data: {
        riderId: rider.id,
        pickupAddress: dto.pickupAddress,
        dropAddress: dto.dropAddress,
        pickupLatitude: dto.pickupLatitude,
        pickupLongitude: dto.pickupLongitude,
        dropLatitude: dto.dropLatitude,
        dropLongitude: dto.dropLongitude,
        distanceInKm: distanceKm,
        estimatedFare,
        vehicleType: dto.vehicleType,
        paymentMethod: dto.paymentMethod ?? PaymentMethod.CASH,
        status: RideStatus.SEARCHING,
      },
    });

    return {
      rideId: ride.id,
      status: ride.status,
      estimatedFare,
      distanceInKm: parseFloat(distanceKm.toFixed(2)),
      nearbyCaptains: nearbyCaptains.length,
      paymentMethod: ride.paymentMethod,
    };
  }

  // ========================== Accept Ride ==========================
  async acceptRide(rideId: string, userId: string) {
    // 1. Get captain profile from userId
    const captain = await this.prisma.captain.findUnique({
      where: { userId },
    });
    if (!captain) throw new BadRequestException('Captain profile not found');

    // 2. She Ride rule — only female captains
    if (captain.gender !== 'FEMALE') {
      throw new BadRequestException('Only female captains can accept rides');
    }

    // 3. Captain must be verified and online
    if (!captain.isVerified) {
      throw new UnauthorizedException('Your account is not verified yet');
    }
    if (!captain.isOnline) {
      throw new BadRequestException('You must be online to accept rides');
    }

    // 4. Check captain has no active ride already
    const activeRide = await this.prisma.ride.findFirst({
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
    });
    if (activeRide)
      throw new BadRequestException('You already have an active ride');

    // 5. Find the ride
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
    });
    if (!ride) throw new NotFoundException('Ride not found');

    // 6. Ride must be in SEARCHING status
    if (ride.status !== RideStatus.SEARCHING) {
      throw new BadRequestException(
        `Ride is already ${ride.status.toLowerCase()}`,
      );
    }

    // 7. Assign captain + update status
    const updated = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        captainId: captain.id,
        status: RideStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      include: {
        rider: {
          include: { user: true },
        },
      },
    });

    // Send OTP to rider for ride verification
    await this.otpService.sendOtp(
      OtpType.RIDE_START,
      updated.rider.user.phoneNumber,
    );

    return {
      rideId: updated.id,
      status: updated.status,
      acceptedAt: updated.acceptedAt,
      captainId: captain.id,
      rider: {
        name: updated.rider.user.fullName,
        phone: updated.rider.user.phoneNumber,
      },
      pickupAddress: updated.pickupAddress,
      dropAddress: updated.dropAddress,
    };
  }

  // ========================== FInd Nearby Captains ==========================
  private async findNearbyCaptains(
    lat: number,
    lng: number,
    vehicleType: VehicleType,
    radiusKm: number,
  ): Promise<any[]> {
    return this.prisma.$queryRaw`
    SELECT * FROM (
      SELECT c.id, c."currentLatitude", c."currentLongitude",
        c.rating, v."vehicleType",
        (6371 * acos(
          LEAST(1.0, 
            cos(radians(${lat})) * cos(radians(c."currentLatitude")) *
            cos(radians(c."currentLongitude") - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(c."currentLatitude"))
          )
        )) AS distance
      FROM captains c
      JOIN vehicles v ON v."captainId" = c.id
      WHERE c."isOnline" = true
        AND c."isVerified" = true
        AND c.gender = 'FEMALE'
        AND v."vehicleType" = ${vehicleType}::"VehicleType"
        AND c."currentLatitude" IS NOT NULL
    ) AS nearby
    WHERE nearby.distance < ${radiusKm}
    ORDER BY nearby.distance
    LIMIT 5
  `;
  }

  // ========================== Captain Arrived ==========================
  async captainArrived(rideId: string, userId: string) {
    const captain = await this.prisma.captain.findUnique({ where: { userId } });
    if (!captain) throw new BadRequestException('Captain profile not found');

    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    if (ride.captainId !== captain.id) {
      throw new UnauthorizedException('You are not assigned to this ride');
    }
    if (ride.status !== RideStatus.ACCEPTED) {
      throw new BadRequestException(
        `Ride is already ${ride.status.toLowerCase()}`,
      );
    }

    const updated = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.ARRIVING,
        arrivedAt: new Date(),
      },
    });

    return {
      rideId: updated.id,
      status: updated.status,
      arrivedAt: updated.arrivedAt,
    };
  }

  // ========================== Start Ride ==========================
  async startRide(rideId: string, userId: string, otp: string) {
    const captain = await this.prisma.captain.findUnique({ where: { userId } });
    if (!captain) throw new BadRequestException('Captain profile not found');

    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        rider: {
          include: { user: true },
        },
      },
    });
    if (!ride) throw new NotFoundException('Ride not found');

    if (ride.captainId !== captain.id) {
      throw new UnauthorizedException('You are not assigned to this ride');
    }
    if (ride.status !== RideStatus.ARRIVING) {
      throw new BadRequestException(
        `Ride cannot be started from status ${ride.status.toLowerCase()}`,
      );
    }

    // Verify OTP using Redis
    const isValid = await this.otpService.verifyOtp(
      OtpType.RIDE_START,
      ride.rider.user.phoneNumber,
      otp,
    );
    if (!isValid) throw new BadRequestException('Invalid or expired OTP');

    const updated = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    return {
      rideId: updated.id,
      status: updated.status,
      startedAt: updated.startedAt,
    };
  }

  // ==========================  Complete Ride ==========================
  async completeRide(rideId: string, userId: string) {
    const captain = await this.prisma.captain.findUnique({ where: { userId } });
    if (!captain) throw new BadRequestException('Captain profile not found');

    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    if (ride.captainId !== captain.id) {
      throw new UnauthorizedException('You are not assigned to this ride');
    }
    if (ride.status !== RideStatus.IN_PROGRESS) {
      throw new BadRequestException(`Ride is not in progress`);
    }

    // Promote estimated fare to final fare
    const updated = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.COMPLETED,
        finalFare: ride.estimatedFare,
        completedAt: new Date(),
      },
    });

    // Mark captain as available again
    await this.prisma.captain.update({
      where: { id: captain.id },
      data: {
        isOnline: true,
        totalTrips: { increment: 1 },
      },
    });

    // Update rider stats
    await this.prisma.rider.update({
      where: { id: ride.riderId },
      data: {
        totalRides: { increment: 1 },
        lastRideAt: new Date(),
      },
    });

    return {
      rideId: updated.id,
      status: updated.status,
      finalFare: updated.finalFare,
      completedAt: updated.completedAt,
    };
  }
}
