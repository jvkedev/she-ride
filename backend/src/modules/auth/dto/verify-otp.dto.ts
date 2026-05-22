import { z } from 'zod';

export const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
  otp: z.string().length(6),
  type: z.enum(['REGISTER', 'LOGIN', 'PASSWORD_RESET', 'RIDE_START']),
});

export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
