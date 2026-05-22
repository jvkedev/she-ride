import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { OtpModule } from './modules/otp/otp.module';
import { env } from './config/env';
import { UserModule } from './modules/user/user.module';
import { UserController } from './modules/user/user.controller';

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
  ],
  controllers: [UserController],
})
export class AppModule {}
