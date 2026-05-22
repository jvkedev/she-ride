import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

import { OtpModule } from '../otp/otp.module';
import { PrismaModule } from '../../prisma/prisma.module';

import { env } from '../../config/env';

import { RolesGuard } from './guards/roles.guard';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    OtpModule,
    PassportModule,

    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: {
        expiresIn: env.JWT_EXPIRES_IN,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
