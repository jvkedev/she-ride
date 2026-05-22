import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),

  email: z.email('Invalid email address'),

  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long'),

  password: z.string().min(8, 'Password must be at least  8 characters'),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const verifyRegisterOtpSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long'),

  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export type VerifyRegisterOtpDto = z.infer<typeof verifyRegisterOtpSchema>;
