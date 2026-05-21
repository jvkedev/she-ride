import { z } from 'zod';

export const sendLoginOtpSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits'),

  //   password: z.string().min(1, 'Password is required'),
});

export type SendLoginOtpDto = z.infer<typeof sendLoginOtpSchema>;

export const verifyLoginOtpSchema = z.object({
  phoneNumber: z.string().min(10).max(10),
  otp: z.string().min(6).max(6),
});

export type VerifyLoginOtpDto = z.infer<typeof verifyLoginOtpSchema>;
