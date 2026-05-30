import { Injectable, NotFoundException } from '@nestjs/common';
import { Gender, UserRole } from '@prisma/client';

import { CloudinaryService } from '../../../common/cloudinary/cloudinary.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateSecurityProfileDto } from './dto/update-security-profile.dto';

@Injectable()
export class SecurityProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private async ensureProfile(userId: string) {
    const existing = await this.prisma.securityStaff.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== UserRole.SECURITY) {
      throw new NotFoundException('Security profile not found');
    }

    return this.prisma.securityStaff.create({ data: { userId } });
  }

  async getProfile(userId: string) {
    await this.ensureProfile(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { securityStaff: true },
    });

    const staff = user?.securityStaff;
    if (!user || !staff) {
      throw new NotFoundException('Security profile not found');
    }

    return {
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImage: staff.profileImage,
      gender: staff.gender,
      dateOfBirth: staff.dateOfBirth?.toISOString() ?? null,
      memberSince: user.createdAt.toISOString(),
      accountStatus: user.accountStatus,
    };
  }

  async updateProfile(userId: string, dto: UpdateSecurityProfileDto) {
    await this.ensureProfile(userId);

    const userUpdates: {
      fullName?: string;
      email?: string;
      phoneNumber?: string;
    } = {};
    if (dto.fullName) userUpdates.fullName = dto.fullName;
    if (dto.email) userUpdates.email = dto.email;
    if (dto.phoneNumber) userUpdates.phoneNumber = dto.phoneNumber;

    const staffUpdates: {
      gender?: Gender;
      dateOfBirth?: Date;
    } = {};
    if (dto.gender) staffUpdates.gender = dto.gender;
    if (dto.dateOfBirth) staffUpdates.dateOfBirth = new Date(dto.dateOfBirth);

    await this.prisma.$transaction([
      ...(Object.keys(userUpdates).length
        ? [
            this.prisma.user.update({
              where: { id: userId },
              data: userUpdates,
            }),
          ]
        : []),
      this.prisma.securityStaff.update({
        where: { userId },
        data: staffUpdates,
      }),
    ]);

    return this.getProfile(userId);
  }

  async updateProfilePhoto(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ profileImage: string }> {
    const staff = await this.ensureProfile(userId);

    if (staff.profileImage) {
      const publicId = this.extractPublicId(staff.profileImage);
      if (publicId) {
        await this.cloudinary.deleteImage(publicId);
      }
    }

    const url = await this.cloudinary.uploadImage(file, 'she-ride/security');

    await this.prisma.securityStaff.update({
      where: { userId },
      data: { profileImage: url },
    });

    return { profileImage: url };
  }

  private extractPublicId(url: string): string | null {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match?.[1] ?? null;
  }
}
