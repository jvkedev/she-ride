import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

import { env } from '../../config/env';

import {
  AccountStatus,
  OnboardingStatus,
  OtpType,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpService } from '../otp/otp.service';
import { redis } from '../../config/redis';

import { RegisterDto, VerifyRegisterOtpDto } from './dto/register.dto';
import type { SendLoginOtpDto, VerifyLoginOtpDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { SelectRoleDto } from './dto/select-role.dto';

type PendingRegisterData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

type RefreshTokenPayload = {
  sub: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
  ) {}

  private generateAccessToken(user: {
    id: string;
    email: string;
    role: string;
    phoneNumber: string;
  }) {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
      {
        secret: env.JWT_ACCESS_SECRET,
        expiresIn: env.JWT_ACCESS_EXPIRES,
      },
    );
  }

  private generateRefreshToken(user: { id: string }) {
    return this.jwtService.sign(
      {
        sub: user.id,
      },
      {
        secret: env.JWT_REFRESH_SECRET,
        expiresIn: env.JWT_REFRESH_EXPIRES,
      },
    );
  }

  private generateTokens(user: {
    id: string;
    email: string;
    role: string;
    phoneNumber: string;
  }) {
    const accessToken = this.generateAccessToken(user);

    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async enforceOtpCooldown(
    type: OtpType,
    phoneNumber: string,
    message: string,
  ) {
    const cooldownKey = `otp-cooldown:${type}:${phoneNumber}`;
    const acquired = await redis.set(cooldownKey, '1', 'EX', 60, 'NX');

    if (acquired !== 'OK') {
      throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(
        dto.refreshToken,
        {
          secret: env.JWT_REFRESH_SECRET,
        },
      );

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      if (!user.refreshToken) {
        throw new UnauthorizedException();
      }

      const storedRefreshToken = user.refreshToken;

      if (!storedRefreshToken) {
        throw new UnauthorizedException();
      }

      const isValid = await argon2.verify(storedRefreshToken, dto.refreshToken);

      if (!isValid) {
        throw new UnauthorizedException();
      }

      const tokens = this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
      });

      const hashedRefreshToken = await argon2.hash(tokens.refreshToken);

      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: hashedRefreshToken,
        },
      });
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ================== Register Otp =================
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

    const pending: PendingRegisterData = {
      fullName: dto.fullName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      password: hashedPassword,
    };

    await redis.setex(
      `pending-register:${dto.phoneNumber}`,
      600,
      JSON.stringify(pending),
    );

    await this.enforceOtpCooldown(
      OtpType.PHONE_VERIFICATION,
      dto.phoneNumber,
      'Please wait 60 seconds before requesting another registration OTP.',
    );

    await this.otpService.sendOtp(OtpType.PHONE_VERIFICATION, dto.phoneNumber);

    return {
      message: 'OTP sent successfully',
    };
  }

  // ================== Verify Register =================
  async verifyRegisterOtp(dto: VerifyRegisterOtpDto) {
    const pendingRaw = await redis.get(`pending-register:${dto.phoneNumber}`);

    if (!pendingRaw) {
      throw new BadRequestException('OTP expired');
    }

    const pending = JSON.parse(pendingRaw) as PendingRegisterData;

    const isValid = await this.otpService.verifyOtp(
      OtpType.PHONE_VERIFICATION,
      dto.phoneNumber,
      dto.otp,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const user = await this.prisma.user.create({
      data: {
        ...pending,
        role: UserRole.PENDING,
        accountStatus: AccountStatus.ACTIVE,
        isPhoneVerified: true,
        onboardingStatus: OnboardingStatus.PENDING,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        accountStatus: true,
        isPhoneVerified: true,
        onboardingStatus: true,
        createdAt: true,
      },
    });

    await redis.del(`pending-register:${dto.phoneNumber}`);
    await redis.setex(`role-selection:${user.id}`, 86_400, '1');

    const tokens = this.generateTokens(user);

    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      message: 'Account created. Select how you want to use She Ride.',
      user,
      requiresRoleSelection: true,
      ...tokens,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        accountStatus: true,
        isPhoneVerified: true,
        onboardingStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roleSelectionSession = await redis.get(`role-selection:${userId}`);

    return {
      user,
      requiresRoleSelection: user.role === UserRole.PENDING,
      canAccessRoleSelection:
        user.role === UserRole.PENDING && roleSelectionSession === '1',
    };
  }

  async selectRole(userId: string, dto: SelectRoleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.PENDING) {
      throw new ConflictException('Role has already been selected');
    }

    const roleSelectionSession = await redis.get(`role-selection:${userId}`);

    if (roleSelectionSession !== '1') {
      throw new ForbiddenException(
        'Role selection is not available. Sign in again to continue account setup.',
      );
    }

    const selectedRole =
      dto.role === 'RIDER' ? UserRole.RIDER : UserRole.CAPTAIN;

    const updatedUser = await this.prisma.$transaction(async (tx) => {
      if (selectedRole === UserRole.RIDER) {
        await tx.rider.create({ data: { userId } });
      } else {
        await tx.captain.create({ data: { userId } });
      }

      return tx.user.update({
        where: { id: userId },
        data: {
          role: selectedRole,
          onboardingStatus:
            selectedRole === UserRole.RIDER
              ? OnboardingStatus.RIDER_COMPLETED
              : OnboardingStatus.CAPTAIN_COMPLETED,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          accountStatus: true,
          isPhoneVerified: true,
          onboardingStatus: true,
          createdAt: true,
        },
      });
    });

    await redis.del(`role-selection:${userId}`);

    const tokens = this.generateTokens(updatedUser);
    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      message: 'Role selected successfully',
      user: updatedUser,
      redirectTo: selectedRole === UserRole.RIDER ? '/rider' : '/captain',
      ...tokens,
    };
  }

  // ================== Login Otp =================
  async sendLoginOtp(dto: SendLoginOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber: dto.phoneNumber,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.accountStatus === AccountStatus.BLOCKED) {
      throw new ForbiddenException('Your account is blocked');
    }

    await this.enforceOtpCooldown(
      OtpType.LOGIN,
      user.phoneNumber,
      'Please wait 60 seconds before requesting another login OTP.',
    );

    await this.otpService.sendOtp(OtpType.LOGIN, user.phoneNumber);

    return {
      message: 'Login OTP sent',
    };
  }

  // ================== Verify Login =================
  async verifyLoginOtp(dto: VerifyLoginOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        phoneNumber: dto.phoneNumber,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const isValid = await this.otpService.verifyOtp(
      OtpType.LOGIN,
      dto.phoneNumber,
      dto.otp,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const tokens = this.generateTokens(user);

    const hashedRefreshToken = await argon2.hash(tokens.refreshToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    if (user.role === UserRole.PENDING) {
      await redis.setex(`role-selection:${user.id}`, 86_400, '1');
    }

    return {
      message: 'Login successful',
      user,
      requiresRoleSelection: user.role === UserRole.PENDING,
      ...tokens,
    };
  }
}
