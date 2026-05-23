import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { OtpModule } from './modules/otp/otp.module';
import { env } from './config/env';
import { UserModule } from './modules/user/user.module';
import { UserController } from './modules/user/user.controller';
import { AdminModule } from './modules/admin/admin.module';
import { RiderModule } from './modules/rider/rider.module';
import { CaptainModule } from './modules/captain/captain.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: env.REDIS_URL,
      },
    }),
    PrismaModule,
    AuthModule,
    OtpModule,
    UserModule,
    AdminModule,
    RiderModule,
    CaptainModule,
  ],
  controllers: [UserController],
})
export class AppModule {}
