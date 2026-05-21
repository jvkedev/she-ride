import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),

  email: z.email("Invalid email address"),

  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyRegisterOtpSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long"),

  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

export type VerifyRegisterOtpInput = z.infer<typeof verifyRegisterOtpSchema>;

export const sendLoginOtpSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number must be 10 digits"),
});

export type SendLoginOtpInput = z.infer<typeof sendLoginOtpSchema>;

export const verifyLoginOtpSchema = z.object({
  phoneNumber: z.string().min(10).max(10),
  otp: z.string().min(6).max(6),
});

export type VerifyLoginOtpInput = z.infer<typeof verifyLoginOtpSchema>;
