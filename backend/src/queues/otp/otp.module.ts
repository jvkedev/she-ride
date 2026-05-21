import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { OtpProcessor } from './otp.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'otp-queue',
    }),
  ],
  providers: [OtpProcessor],
  exports: [BullModule],
})
export class OtpModule {}
