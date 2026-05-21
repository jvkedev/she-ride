import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { OtpService } from './otp.service';
import { OtpProcessor } from '../../queues/otp/otp.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'otp-queue',
    }),
  ],
  providers: [OtpService, OtpProcessor],
  exports: [OtpService],
})
export class OtpModule {}
