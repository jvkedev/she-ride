import 'dotenv/config';

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

  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),

  REDIS_URL: required('REDIS_URL'),

  TWILIO_ACCOUNT_SID: required('TWILIO_ACCOUNT_SID'),
  TWILIO_AUTH_TOKEN: required('TWILIO_AUTH_TOKEN'),
  TWILIO_PHONE_NUMBER: required('TWILIO_PHONE_NUMBER'),
};
