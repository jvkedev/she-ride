import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

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

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60_000, // 1 min window
          limit: 20, // 20 requests per min globally
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
