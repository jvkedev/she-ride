import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { AccountStatus, Gender, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import { redis } from '../../config/redis';

import { RegisterDto, VerifyRegisterOtpDto } from './dto/register.dto';

import type { SendLoginOtpDto, VerifyLoginOtpDto } from './dto/login.dto';

type PendingRegisterData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  gender: Gender;
  otp: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  async sendRegisterOtp(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phoneNumber: dto.phoneNumber }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or phone number already exists');
    }

    const hashedPassword = await argon2.hash(dto.password);
    const otp = this.otpService.generateOtp();

    const pendingData: PendingRegisterData = {
      fullName: dto.fullName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      password: hashedPassword,
      gender: dto.gender,
      otp,
    };

    await redis.setex(
      `pending-register:${dto.phoneNumber}`,
      600,
      JSON.stringify(pendingData),
    );

    await this.otpService.sendRegistrationOtp(
      'pending-user',
      dto.phoneNumber,
      otp,
    );

    return {
      message: 'OTP sent successfully. Please verify to complete registration.',
    };
  }

  async verifyRegisterOtp(dto: VerifyRegisterOtpDto) {
    const pendingDataString = await redis.get(
      `pending-register:${dto.phoneNumber}`,
    );

    if (!pendingDataString) {
      throw new BadRequestException(
        'Registration OTP expired. Please try again.',
      );
    }

    const pendingData = JSON.parse(pendingDataString) as PendingRegisterData;

    if (pendingData.otp !== dto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const user = await this.prisma.user.create({
      data: {
        fullName: pendingData.fullName,
        email: pendingData.email,
        phoneNumber: pendingData.phoneNumber,
        password: pendingData.password,
        gender: pendingData.gender,
        role: UserRole.RIDER,
        accountStatus: AccountStatus.ACTIVE,
        isPhoneVerified: true,
        riderProfile: {
          create: {},
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        gender: true,
        accountStatus: true,
        isPhoneVerified: true,
        createdAt: true,
      },
    });

    await redis.del(`pending-register:${dto.phoneNumber}`);

    return {
      message: 'Rider registered successfully',
      user,
    };
  }

  async sendLoginOtp(dto: SendLoginOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber: dto.phoneNumber,
      },
    });

    if (!user) {
      throw new NotFoundException('No account found with this phone number');
    }

    if (user.accountStatus === AccountStatus.BLOCKED) {
      throw new ForbiddenException('Your account is blocked');
    }

    await this.otpService.sendLoginOtp(user.id, user.phoneNumber);

    return {
      message: 'Login OTP sent successfully',
    };
  }

  async verifyLoginOtp(dto: VerifyLoginOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber: dto.phoneNumber,
      },
    });

    if (!user) {
      throw new NotFoundException('No account found with this phone number');
    }

    const isOtpValid = await this.otpService.verifyOtp(user.id, dto.otp);

    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        gender: user.gender,
        accountStatus: user.accountStatus,
        isPhoneVerified: user.isPhoneVerified,
      },
    };
  }
}
