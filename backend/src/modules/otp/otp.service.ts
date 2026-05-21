import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue, QueueEvents } from 'bullmq';
import { redis } from '../../config/redis';

@Injectable()
export class OtpService {
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

  async sendRegistrationOtp(userId: string, phoneNumber: string, otp: string) {
    const job = await this.otpQueue.add('send-rider-register-otp', {
      userId,
      phoneNumber,
      otp,
    });

    await job.waitUntilFinished(this.queueEvents);

    return {
      success: true,
    };
  }

  async sendLoginOtp(userId: string, phoneNumber: string) {
    const otp = this.generateOtp();

    await redis.setex(`login-otp:${userId}`, 600, otp);

    const job = await this.otpQueue.add('send-rider-login-otp', {
      userId,
      phoneNumber,
      otp,
    });

    await job.waitUntilFinished(this.queueEvents);

    return {
      success: true,
    };
  }

  async verifyOtp(userId: string, otp: string): Promise<boolean> {
    const savedOtp = await redis.get(`login-otp:${userId}`);

    if (!savedOtp) {
      return false;
    }

    if (savedOtp !== otp) {
      return false;
    }

    await redis.del(`login-otp:${userId}`);

    return true;
  }
}
