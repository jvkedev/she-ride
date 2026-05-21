import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import twilio from 'twilio';
import { env } from '../../config/env';

type SendOtpJobData = {
  userId: string;
  phoneNumber: string;
  otp: string;
};

@Processor('otp-queue')
export class OtpProcessor extends WorkerHost {
  private readonly twilioClient = twilio(
    env.TWILIO_ACCOUNT_SID,
    env.TWILIO_AUTH_TOKEN,
  );

  constructor() {
    super();
    console.log('OTP Processor started...');
  }

  async process(job: Job<SendOtpJobData>): Promise<{ success: boolean }> {
    const { userId, phoneNumber, otp } = job.data;

    console.log('OTP job received:', job.name, {
      userId,
      phoneNumber,
      otp, // only for development
    });

    try {
      const message = await this.twilioClient.messages.create({
        body: `Your She Ride OTP is ${otp}. It will expire in 10 minutes.`,
        from: env.TWILIO_PHONE_NUMBER,
        to: `+91${phoneNumber}`,
      });

      console.log('OTP SMS sent:', message.sid);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to send OTP SMS:', error);
      throw error;
    }
  }
}
