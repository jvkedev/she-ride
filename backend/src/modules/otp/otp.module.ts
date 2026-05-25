import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OtpProcessor } from './otp.processor';
import { OtpService } from './otp.service';

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
