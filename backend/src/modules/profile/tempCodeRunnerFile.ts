import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

export interface RiderProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  walletBalance: number;
  rating: number;
  totalRides: number;
  cancelledRides: number;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  defaultPickupAddress: string | null;
  defaultDropAddress: string | null;
  ridePreference: string | null;
  safetyAlertEnabled: boolean;
  shareLiveLocation: boolean;
  memberSince: string;
}

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async getRiderProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        rider: true,
      },
    });

    if (!user || !user.rider)
      throw new NotFoundException('Rider profile not found');

    return {
      id: user.rider.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImage: user.rider.profileImage,
      gender: user.rider.gender,
      dateOfBirth: user.rider.dateOfBirth,
      walletBalance: user.rider.walletBalance,
      rating: user.rider.averageRating,
      totalRides: user.rider.totalRides,
      cancelledRides: user.rider.cancelledRides,
      emergencyContactName: user.rider.emergencyContactName,
      emergencyContactPhone: user.rider.emergencyContactPhone,
      defaultPickupAddress: user.rider.defaultPickupAddress,
      defaultDropAddress: user.rider.defaultDropAddress,
      ridePreference: user.rider.ridePreference,
      safetyAlertEnabled: user.rider.safetyAlertEnabled,
      shareLiveLocation: user.rider.shareLiveLocation,
      memberSince: user.createdAt,
    };
  }

  async updateRiderProfile(userId: string, dto: UpdateRiderProfileDto) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider profile not found');

    // Update User table fields
    if (dto.fullName || dto.email) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.fullName && { fullName: dto.fullName }),
          ...(dto.email && { email: dto.email }),
        },
      });
    }

    // Update Rider table fields
    const updated = await this.prisma.rider.update({
      where: { userId },
      data: {
        ...(dto.gender && { gender: dto.gender }),
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.emergencyContactName && {
          emergencyContactName: dto.emergencyContactName,
        }),
        ...(dto.emergencyContactPhone && {
          emergencyContactPhone: dto.emergencyContactPhone,
        }),
        ...(dto.defaultPickupAddress !== undefined && {
          defaultPickupAddress: dto.defaultPickupAddress,
        }), // ← add
        ...(dto.defaultDropAddress !== undefined && {
          defaultDropAddress: dto.defaultDropAddress,
        }), // ← add
        ...(dto.ridePreference && { ridePreference: dto.ridePreference }),
        ...(dto.safetyAlertEnabled !== undefined && {
          safetyAlertEnabled: dto.safetyAlertEnabled,
        }),
        ...(dto.shareLiveLocation !== undefined && {
          shareLiveLocation: dto.shareLiveLocation,
        }),
      },
      include: { user: true },
    });

    return {
      fullName: updated.user.fullName,
      email: updated.user.email,
      gender: updated.gender,
      dateOfBirth: updated.dateOfBirth,
      emergencyContactName: updated.emergencyContactName,
      emergencyContactPhone: updated.emergencyContactPhone,
      defaultPickupAddress: updated.defaultPickupAddress,
      defaultDropAddress: updated.defaultDropAddress,
      ridePreference: updated.ridePreference,
      safetyAlertEnabled: updated.safetyAlertEnabled,
      shareLiveLocation: updated.shareLiveLocation,
    };
  }

  async updateProfilePhoto(userId: string, file: Express.Multer.File) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
      select: { id: true, profileImage: true },
    });
    if (!rider) throw new NotFoundException('Rider profile not found');

    // Delete old image from Cloudinary if exists
    if (rider.profileImage) {
      const publicId = this.extractPublicId(rider.profileImage);
      if (publicId) await this.cloudinary.deleteImage(publicId);
    }

    // Upload new image
    const url = await this.cloudinary.uploadImage(file, 'she-ride/riders');

    // Save to DB
    await this.prisma.rider.update({
      where: { userId },
      data: { profileImage: url },
    });

    return { profileImage: url };
  }

  private extractPublicId(url: string): string | null {
    try {
      // e.g. https://res.cloudinary.com/cloud/image/upload/v123/she-ride/riders/abc.jpg
      // extracts: she-ride/riders/abc
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;
      const withVersion = parts[1]; // v123/she-ride/riders/abc.jpg
      const withoutVersion = withVersion.replace(/^v\d+\//, '');
      return withoutVersion.replace(/\.[^.]+$/, ''); // remove extension
    } catch {
      return null;
    }
  }
}

export class UpdateRiderProfileDto {
  fullName?: string;
  email?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  defaultPickupAddress?: string;
  defaultDropAddress?: string;
  ridePreference?: 'QUIET' | 'CHATTY' | 'WOMEN_ONLY' | 'PET_FRIENDLY';
  safetyAlertEnabled?: boolean;
  shareLiveLocation?: boolean;
}
