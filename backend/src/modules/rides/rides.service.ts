import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { RideGateway } from '../gateway/ride.gateway';
import { OtpService } from '../otp/otp.service';
import {
  RideStatus,
  PaymentMethod,
  VehicleType,
  OtpType,
  UserRole,
} from '@prisma/client';
import { CreateRideDto } from './dto/create-ride.dto';
import { EstimateRideDto } from './dto/estimate-ride.dto';
import { HistoryQueryDto } from './dto/history-ride.dto';
import { haversineDistance } from './helpers/haversine.helper';
import { FareConfigService } from '../platform/fare-config.service';
import { RideRedisService } from '../redis/ride-redis.service';

@Injectable()
export class RidesService {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
    private gateway: RideGateway,
    private rideRedis: RideRedisService,
    private fareConfig: FareConfigService,
  ) {}

  // ========================== Estimate Ride ==========================
  async estimateRide(dto: EstimateRideDto, userId: string) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new BadRequestException('Rider profile not found');

    const distanceKm = haversineDistance(
      dto.pickupLatitude,
      dto.pickupLongitude,
      dto.dropLatitude,
      dto.dropLongitude,
    );

    const vehicleTypes: VehicleType[] = [
      VehicleType.BIKE,
      VehicleType.AUTO,
      VehicleType.CAR,
      VehicleType.SUV,
    ];

    const estimates = await Promise.all(
      vehicleTypes.map(async (vehicleType) => {
        const estimatedFare = await this.fareConfig.calculateFare(
          distanceKm,
          vehicleType,
        );
        const nearbyCaptains = await this.findNearbyCaptains(
          dto.pickupLatitude,
          dto.pickupLongitude,
          vehicleType,
          5,
        );
        return {
          vehicleType,
          estimatedFare,
          distanceInKm: parseFloat(distanceKm.toFixed(2)),
          nearbyCaptains: nearbyCaptains.length,
        };
      }),
    );

    return estimates;
  }

  // Add these two methods to RidesService

  async getRiderHistory(userId: string, query: HistoryQueryDto) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider profile not found');

    const { page, limit } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where: {
          riderId: rider.id,
          status: { in: [RideStatus.COMPLETED, RideStatus.CANCELED] },
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: Number(limit),
        select: {
          id: true,
          pickupAddress: true,
          dropAddress: true,
          distanceInKm: true,
          finalFare: true,
          estimatedFare: true,
          vehicleType: true,
          paymentMethod: true,
          status: true,
          startedAt: true,
          completedAt: true,
          captain: {
            select: {
              user: { select: { fullName: true, phoneNumber: true } },
              rating: true,
              vehicle: {
                select: {
                  brand: true,
                  model: true,
                  color: true,
                  vehicleNumber: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.ride.count({
        where: {
          riderId: rider.id,
          status: { in: [RideStatus.COMPLETED, RideStatus.CANCELED] },
        },
      }),
    ]);

    return {
      data: rides,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async cancelRide(rideId: string, userId: string, reason?: string) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    const captain = await this.prisma.captain.findUnique({ where: { userId } });

    if (!rider && !captain) {
      throw new BadRequestException('User profile not found');
    }

    const ride = await this.prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');

    const cancellableStatuses = [
      RideStatus.SEARCHING,
      RideStatus.ACCEPTED,
      RideStatus.ARRIVING,
    ] as RideStatus[];

    if (!cancellableStatuses.includes(ride.status)) {
      throw new BadRequestException(
        `Ride cannot be cancelled in ${ride.status.toLowerCase()} status`,
      );
    }

    if (rider && ride.riderId !== rider.id) {
      throw new UnauthorizedException('You are not the rider of this ride');
    }
    if (captain && ride.captainId !== captain.id) {
      throw new UnauthorizedException('You are not assigned to this ride');
    }

    // Use UserRole enum to match your schema
    const cancelledBy = rider ? UserRole.RIDER : UserRole.CAPTAIN;

    const updated = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        status: RideStatus.CANCELED,
        cancelledBy,
        cancellationReason: reason ?? null,
        cancelledAt: new Date(),
      },
    });

    // Free up captain if one was assigned
    if (ride.captainId) {
      await this.prisma.captain.update({
        where: { id: ride.captainId },
        data: { isOnline: true },
      });
    }

    await this.rideRedis.deleteRideState(rideId);
    await this.rideRedis.removeSearchingRide(rideId, ride.vehicleType);

    this.gateway.notifyRideStatusChange(rideId, {
      rideId,
      status: RideStatus.CANCELED,
      cancelledBy,
      reason: reason ?? null,
    });

    return {
      rideId: updated.id,
      status: updated.status,
      cancelledBy,
      cancellationReason: updated.cancellationReason,
      cancelledAt: updated.cancelledAt,
    };
  }

  async getCaptainHistory(userId: string, query: HistoryQueryDto) {
    const captain = await this.prisma.captain.findUnique({ where: { userId } });
    if (!captain) throw new NotFoundException('Captain profile not found');

    const { page, limit } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where: {
          captainId: captain.id,
          status: { in: [RideStatus.COMPLETED, RideStatus.CANCELED] },
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: Number(limit),
        select: {
          id: true,
          pickupAddress: true,
          dropAddress: true,
          distanceInKm: true,
          finalFare: true,
          estimatedFare: true,
          vehicleType: true,
          paymentMethod: true,
          status: true,
          startedAt: true,
          completedAt: true,
          rider: {
            select: {
              user: { select: { fullName: true, phoneNumber: true } },
              averageRating: true,
            },
          },
        },
      }),
      this.prisma.ride.count({
        where: {
          captainId: captain.id,
          status: { in: [RideStatus.COMPLETED, RideStatus.CANCELED] },
        },
      }),
    ]);

    return {
      data: rides,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getRiderRideDetails(rideId: string, userId: string) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new BadRequestException('Rider profile not found');

    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        captain: {
          include: {
            user: { select: { fullName: true, phoneNumber: true } },
            vehicle: true,
          },
        },
      },
    });
    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.riderId !== rider.id) {
      throw new UnauthorizedException('Not your ride');
    }

    return {
      id: ride.id,
      status: ride.status,
      pickupAddress: ride.pickupAddress,
      dropAddress: ride.dropAddress,
      pickupLatitude: ride.pickupLatitude,
      pickupLongitude: ride.pickupLongitude,
      dropLatitude: ride.dropLatitude,
      dropLongitude: ride.dropLongitude,
      distanceInKm: ride.distanceInKm,
      estimatedFare: ride.estimatedFare,
      finalFare: ride.finalFare,
      vehicleType: ride.vehicleType,
      paymentMethod: ride.paymentMethod,
      paymentStatus: ride.paymentStatus,
      startedAt: ride.startedAt,
      completedAt: ride.completedAt,
      cancelledAt: ride.cancelledAt,
      cancellationReason: ride.cancellationReason,
      captain: ride.captain
        ? {
            name: ride.captain.user.fullName,
            phone: ride.captain.user.phoneNumber,
            rating: ride.captain.rating,
            vehicle: ride.captain.vehicle
              ? {
                  brand: ride.captain.vehicle.brand,
                  model: ride.captain.vehicle.model,
                  color: ride.captain.vehicle.color,
                  plate: ride.captain.vehicle.vehicleNumber,
                  type: ride.captain.vehicle.vehicleType,
                }
              : null,
          }
        : null,
    };
  }

  async getRideDetails(rideId: string, userId: string) {
    const captain = await this.prisma.captain.findUnique({ where: { userId } });
    if (!captain) throw new BadRequestException('Captain profile not found');

    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        rider: { include: { user: true } },
      },
    });
    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.captainId !== captain.id)
      throw new UnauthorizedException('Not your ride');

    return {
      rideId: ride.id,
      status: ride.status,
      rider: {
        name: ride.rider.user.fullName,
        phone: ride.rider.user.phoneNumber,
      },
      pickupAddress: ride.pickupAddress,
      dropAddress: ride.dropAddress,
      pickupLatitude: ride.pickupLatitude,
      pickupLongitude: ride.pickupLongitude,
      dropLatitude: ride.dropLatitude,
      dropLongitude: ride.dropLongitude,
      estimatedFare: ride.estimatedFare,
      finalFare: ride.finalFare,
      distanceInKm: ride.distanceInKm,
      vehicleType: ride.vehicleType,
      paymentMethod: ride.paymentMethod,
    };
  }

  async getCaptainActiveRide(userId: string) {
    const captain = await this.prisma.captain.findUnique({ where: { userId } });
    if (!captain) throw new BadRequestException('Captain profile not found');

    const ride = await this.prisma.ride.findFirst({
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
      include: {
        rider: {
          include: {
            user: { select: { fullName: true, phoneNumber: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!ride) return null;

    return {
      rideId: ride.id,
      status: ride.status,
      rider: {
        name: ride.rider.user.fullName,
        phone: ride.rider.user.phoneNumber,
      },
      pickupAddress: ride.pickupAddress,
      dropAddress: ride.dropAddress,
      pickupLatitude: ride.pickupLatitude,
      pickupLongitude: ride.pickupLongitude,
      dropLatitude: ride.dropLatitude,
      dropLongitude: ride.dropLongitude,
      estimatedFare: ride.estimatedFare,
      finalFare: ride.finalFare,
      distanceInKm: ride.distanceInKm,
      vehicleType: ride.vehicleType,
      paymentMethod: ride.paymentMethod,
    };
  }

  async getRiderActiveRide(userId: string) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new BadRequestException('Rider profile not found');

    const ride = await this.prisma.ride.findFirst({
      where: {
        riderId: rider.id,
        status: {
          in: [
            RideStatus.SEARCHING,
            RideStatus.ACCEPTED,
            RideStatus.ARRIVING,
            RideStatus.IN_PROGRESS,
          ],
        },
      },
      include: {
        captain: {
          include: {
            user: { select: { fullName: true, phoneNumber: true } },
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!ride) return null;

    return {
      rideId: ride.id,
      status: ride.status,
      pickupAddress: ride.pickupAddress,
      dropAddress: ride.dropAddress,
      pickupLatitude: ride.pickupLatitude,
      pickupLongitude: ride.pickupLongitude,
      dropLatitude: ride.dropLatitude,
      dropLongitude: ride.dropLongitude,
      estimatedFare: ride.estimatedFare,
      distanceInKm: ride.distanceInKm,
      vehicleType: ride.vehicleType,
      paymentMethod: ride.paymentMethod,
      captain: ride.captain
        ? {
            name: ride.captain.user.fullName,
            phone: ride.captain.user.phoneNumber,
            rating: ride.captain.rating,
            lat: ride.captain.currentLatitude,
            lng: ride.captain.currentLongitude,
            vehicle: ride.captain.vehicle
              ? {
                  brand: ride.captain.vehicle.brand,
                  model: ride.captain.vehicle.model,
                  color: ride.captain.vehicle.color,
                  plate: ride.captain.vehicle.vehicleNumber,
                  type: ride.captain.vehicle.vehicleType,
                }
              : null,
          }
        : null,
    };
  }

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
            RideStatus.ARRIVING,
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
    const estimatedFare = await this.fareConfig.calculateFare(
      distanceKm,
      dto.vehicleType,
    );

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

    await this.rideRedis.setRideState({
      rideId: ride.id,
      status: RideStatus.SEARCHING,
      riderId: rider.id,
      vehicleType: dto.vehicleType,
      pickupLat: dto.pickupLatitude,
      pickupLng: dto.pickupLongitude,
      dropLat: dto.dropLatitude,
      dropLng: dto.dropLongitude,
      searchingStep: 'SCANNING',
      nearbyCaptains: nearbyCaptains.length,
      updatedAt: new Date().toISOString(),
    });

    await this.rideRedis.addSearchingRide(ride.id, dto.vehicleType);

    this.gateway.notifySearchingProgress(ride.id, {
      step: 'SCANNING',
      label: 'Searching nearby captains',
      nearbyCaptains: nearbyCaptains.length,
      etaSeconds: Math.max(30, nearbyCaptains.length > 0 ? 45 : 90),
    });

    setTimeout(() => {
      this.gateway.notifySearchingProgress(ride.id, {
        step: 'BROADCASTING',
        label: 'Sending ride requests',
        nearbyCaptains: nearbyCaptains.length,
        etaSeconds: 40,
      });
    }, 600);

    setTimeout(() => {
      this.gateway.notifySearchingProgress(ride.id, {
        step: 'WAITING',
        label: 'Waiting for captain response',
        nearbyCaptains: nearbyCaptains.length,
        etaSeconds: 35,
      });
    }, 1400);

    this.gateway.broadcastNewSearchingRide(dto.vehicleType, {
      rideId: ride.id,
      pickupAddress: dto.pickupAddress,
      dropAddress: dto.dropAddress,
      pickupLatitude: dto.pickupLatitude,
      pickupLongitude: dto.pickupLongitude,
      dropLatitude: dto.dropLatitude,
      dropLongitude: dto.dropLongitude,
      estimatedFare,
      distanceInKm: parseFloat(distanceKm.toFixed(2)),
      vehicleType: dto.vehicleType,
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

    // 7. Assign captain + update status (keep online for location broadcasts)
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
        captain: {
          include: {
            user: true,
            vehicle: true,
          },
        },
      },
    });

    await this.rideRedis.removeSearchingRide(rideId, ride.vehicleType);
    await this.rideRedis.patchRideState(rideId, {
      status: RideStatus.ACCEPTED,
      captainId: captain.id,
      searchingStep: 'FOUND',
    });

    if (
      captain.currentLatitude != null &&
      captain.currentLongitude != null
    ) {
      await this.rideRedis.setCaptainLocation({
        captainId: captain.id,
        userId,
        lat: captain.currentLatitude,
        lng: captain.currentLongitude,
        vehicleType: updated.captain?.vehicle?.vehicleType,
        updatedAt: new Date().toISOString(),
      });
    }

    await this.otpService.sendOtp(
      OtpType.RIDE_START,
      updated.rider.user.phoneNumber,
    );

    const vehicle = updated.captain?.vehicle;

    this.gateway.notifySearchingProgress(rideId, {
      step: 'FOUND',
      label: 'Captain found',
      etaSeconds: null,
    });

    this.gateway.notifyRiderCaptainAccepted(updated.rider.user.id, {
      rideId: updated.id,
      status: updated.status,
      captain: {
        name: updated.captain?.user.fullName ?? 'Captain',
        phone: updated.captain?.user.phoneNumber ?? null,
        rating: captain.rating,
        lat: captain.currentLatitude,
        lng: captain.currentLongitude,
        vehicle: vehicle
          ? {
              brand: vehicle.brand,
              model: vehicle.model,
              color: vehicle.color,
              plate: vehicle.vehicleNumber,
              type: vehicle.vehicleType,
            }
          : null,
      },
      pickupAddress: updated.pickupAddress,
      dropAddress: updated.dropAddress,
      pickupLatitude: updated.pickupLatitude,
      pickupLongitude: updated.pickupLongitude,
      dropLatitude: updated.dropLatitude,
      dropLongitude: updated.dropLongitude,
    });

    this.gateway.notifyRideStatusChange(rideId, {
      rideId: updated.id,
      status: updated.status,
    });

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
    try {
      const redisIds = await this.rideRedis.findNearbyCaptainIds(
        lat,
        lng,
        vehicleType,
        radiusKm,
        5,
      );
      if (redisIds.length > 0) {
        const captains = await this.prisma.captain.findMany({
          where: {
            id: { in: redisIds },
            isOnline: true,
            isVerified: true,
            gender: 'FEMALE',
          },
          include: { vehicle: true },
        });
        return captains.filter((c) => c.vehicle?.vehicleType === vehicleType);
      }
    } catch {
      // fallback to SQL
    }

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

  // ========================== Get Searching Rides ==========================
  async getSearchingRides(userId: string) {
    const captain = await this.prisma.captain.findUnique({
      where: { userId },
      include: { vehicle: true }, // ← include vehicle to get vehicleType
    });
    if (!captain) throw new BadRequestException('Captain profile not found');
    if (!captain.isVerified) {
      return [];
    }
    if (!captain.vehicle)
      throw new BadRequestException('Captain has no vehicle registered');

    const rides = await this.prisma.ride.findMany({
      where: {
        status: RideStatus.SEARCHING,
        vehicleType: captain.vehicle.vehicleType, // ← from vehicle relation
      },
      include: {
        rider: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return rides.map((ride) => ({
      rideId: ride.id,
      passengerName: ride.rider.user.fullName,
      passengerRating: ride.rider.averageRating ?? 5.0, // ← averageRating not rating
      fare: ride.estimatedFare,
      distanceInKm: ride.distanceInKm,
      vehicleType: ride.vehicleType,
      paymentMethod: ride.paymentMethod,
      pickup: ride.pickupAddress,
      dropoff: ride.dropAddress,
    }));
  }

  // ========================== Update Captain Location ==========================
  async updateLocation(userId: string, lat: number, lng: number) {
    const captain = await this.prisma.captain.findUnique({
      where: { userId },
      include: { vehicle: true },
    });
    if (!captain) throw new BadRequestException('Captain profile not found');

    await this.prisma.captain.update({
      where: { id: captain.id },
      data: {
        currentLatitude: lat,
        currentLongitude: lng,
      },
    });

    if (captain.isOnline && captain.vehicle) {
      await this.rideRedis.setCaptainLocation({
        captainId: captain.id,
        userId,
        lat,
        lng,
        vehicleType: captain.vehicle.vehicleType,
        updatedAt: new Date().toISOString(),
      });
    }

    return { success: true };
  }
  // ========================== Get Captain Location ==========================
  async getCaptainLocation(rideId: string, userId: string) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new BadRequestException('Rider profile not found');

    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: { captain: true },
    });
    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.riderId !== rider.id) throw new UnauthorizedException();

    // No captain yet — return status so frontend can show "searching" state
    if (!ride.captain) {
      const redisState = await this.rideRedis.getRideState(rideId);
      return {
        status: redisState?.status ?? ride.status,
        lat: null,
        lng: null,
      };
    }

    const redisLoc = await this.rideRedis.getCaptainLocation(ride.captain.id);

    return {
      status: ride.status,
      lat: redisLoc?.lat ?? ride.captain.currentLatitude,
      lng: redisLoc?.lng ?? ride.captain.currentLongitude,
    };
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

    this.gateway.notifyRideStatusChange(rideId, {
      rideId: updated.id,
      status: updated.status,
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

    this.gateway.notifyRideStatusChange(rideId, {
      rideId: updated.id,
      status: updated.status,
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
        paymentStatus:
          ride.paymentMethod === 'CASH' || ride.paymentMethod === 'UPI'
            ? 'PAID'
            : ride.paymentStatus,
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

    this.gateway.notifyRideStatusChange(rideId, {
      rideId: updated.id,
      status: updated.status,
      finalFare: updated.finalFare,
    });

    return {
      rideId: updated.id,
      status: updated.status,
      finalFare: updated.finalFare,
      completedAt: updated.completedAt,
    };
  }
}
