import 'dotenv/config';

import type { StringValue } from 'ms';

function required(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  PORT: Number(optional('PORT', '4000')),

  DATABASE_URL: required('DATABASE_URL'),

  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),

  JWT_ACCESS_EXPIRES: optional('JWT_ACCESS_EXPIRES', '15m') as StringValue,

  JWT_REFRESH_EXPIRES: optional('JWT_REFRESH_EXPIRES', '7d') as StringValue,

  REDIS_URL: required('REDIS_URL'),

  FAST2SMS_API_KEY: required('FAST2SMS_API_KEY'),

  CLOUDINARY_CLOUD_NAME: required('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: required('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: required('CLOUDINARY_API_SECRET'),
};
