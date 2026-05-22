import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { OtpType } from '@prisma/client';
import { redis } from '../../config/redis';

@Injectable()
export class OtpService implements OnModuleDestroy {
  private readonly queueEvents = new QueueEvents('otp-queue', {
    connection: {
      host: '127.0.0.1',
      port: 6379,
    },
  });

  constructor(@InjectQueue('otp-queue') private readonly otpQueue: Queue) {}

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getKey(type: OtpType, identifier: string) {
    return `otp:${type}:${identifier}`;
  }

  async sendOtp(
    type: OtpType,
    identifier: string,
    phoneNumber: string,
  ): Promise<{ success: boolean }> {
    const otp = this.generateOtp();

    const key = this.getKey(type, identifier);

    await redis.setex(key, 600, otp);

    const job = await this.otpQueue.add('send-otp', {
      phoneNumber,
      otp,
      type,
    });

    await job.waitUntilFinished(this.queueEvents);

    return { success: true };
  }

  async verifyOtp(
    type: OtpType,
    identifier: string,
    otp: string,
  ): Promise<boolean> {
    const key = this.getKey(type, identifier);

    const savedOtp = await redis.get(key);

    if (!savedOtp) return false;

    if (savedOtp !== otp) return false;

    await redis.del(key);

    return true;
  }

  async onModuleDestroy() {
    await this.queueEvents.close();
  }
}
