import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { OtpModule } from './modules/otp/otp.module';
import { env } from './config/env';

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
  ],
})
export class AppModule {}
