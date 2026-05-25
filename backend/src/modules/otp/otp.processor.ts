import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { env } from '../../config/env';
import axios from 'axios';

type SendOtpJobData = {
  phoneNumber: string;
  otp: string;
};

@Processor('otp-queue')
export class OtpProcessor extends WorkerHost {
  constructor() {
    super();
    console.log('OTP Processor started...');
  }

  async process(job: Job<SendOtpJobData>): Promise<{ success: boolean }> {
    const { phoneNumber, otp } = job.data;

    console.log('OTP job received:', { phoneNumber, otp });
    console.log('FAST2SMS KEY =', env.FAST2SMS_API_KEY);

    try {
      const params = new URLSearchParams({
        route: 'q',
        message: `Your She Ride OTP is ${otp}`,
        language: 'english',
        flash: '0',
        numbers: phoneNumber,
      });

      const response = await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        params,
        {
          headers: {
            authorization: env.FAST2SMS_API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      console.log('OTP sent successfully:', response.data);

      return { success: true };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Fast2SMS Error:', error.response?.data);
      } else {
        console.error('Unknown Error:', error);
      }

      throw error;
    }
  }
}
