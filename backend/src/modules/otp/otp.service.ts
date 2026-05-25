import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { OtpType } from '@prisma/client';
import { redis } from '../../config/redis';

@Injectable()
export class OtpService {
  constructor(
    @InjectQueue('otp-queue')
    private readonly otpQueue: Queue,
  ) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getKey(type: OtpType, identifier: string) {
    return `otp:${type}:${identifier}`;
  }

  async sendOtp(
    type: OtpType,
    phoneNumber: string,
  ): Promise<{ success: boolean }> {
    const otp = this.generateOtp();

    const key = this.getKey(type, phoneNumber);

    // store OTP for 10 minutes
    await redis.setex(key, 600, otp);

    // push job to queue
    await this.otpQueue.add('send-otp', {
      phoneNumber,
      otp,
    });

    return { success: true };
  }

  async verifyOtp(
    type: OtpType,
    phoneNumber: string,
    otp: string,
  ): Promise<boolean> {
    const key = this.getKey(type, phoneNumber);

    const savedOtp = await redis.get(key);

    if (!savedOtp) return false;

    if (savedOtp !== otp) return false;

    await redis.del(key);

    return true;
  }
}
