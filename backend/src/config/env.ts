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

  TWILIO_ACCOUNT_SID: required('TWILIO_ACCOUNT_SID'),
  TWILIO_AUTH_TOKEN: required('TWILIO_AUTH_TOKEN'),
  TWILIO_PHONE_NUMBER: required('TWILIO_PHONE_NUMBER'),
};
