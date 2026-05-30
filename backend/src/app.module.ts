import { BullModule } from '@nestjs/bullmq';
import { ExecutionContext, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Request } from 'express';

import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { OtpModule } from './modules/otp/otp.module';
import { env } from './config/env';
import { UserModule } from './modules/user/user.module';
import { UserController } from './modules/user/user.controller';
import { AdminModule } from './modules/admin/admin.module';
import { RiderModule } from './modules/rider/rider.module';
import { CaptainModule } from './modules/captain/captain.module';
import { RidesModule } from './modules/rides/rides.module';
import { LocationModule } from './modules/location/location.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { SecurityModule } from './modules/security/security.module';
import { RedisModule } from './modules/redis/redis.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SupportModule } from './modules/support/support.module';
import { PlatformModule } from './modules/platform/platform.module';

@Module({
  imports: [
    RedisModule,
    ThrottlerModule.forRoot({
      skipIf: (context: ExecutionContext): boolean => {
        const request = context.switchToHttp().getRequest<Request>();
        const originalUrl = request.originalUrl ?? request.url ?? '';
        const path = originalUrl.split('?')[0];

        const isOptions = request.method === 'OPTIONS';
        const isAuthPath = path.startsWith('/auth');

        return isOptions || isAuthPath;
      },
      throttlers: [
        {
          name: 'default',
          ttl: 60_000,
          limit: 150,
        },
      ],
      storage: new ThrottlerStorageRedisService(env.REDIS_URL),
    }),
    BullModule.forRoot({
      connection: { url: env.REDIS_URL },
    }),
    PrismaModule,
    AuthModule,
    OtpModule,
    UserModule,
    AdminModule,
    RiderModule,
    CaptainModule,
    RidesModule,
    LocationModule,
    GatewayModule,
    ProfileModule,
    CloudinaryModule,
    SecurityModule,
    ReportsModule,
    SupportModule,
    PlatformModule,
  ],
  controllers: [UserController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
