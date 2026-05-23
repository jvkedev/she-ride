# SheRide Authentication System - Code Analysis Guide

For comprehensive authentication flow documentation and code analysis, see:
📋 **Authentication Analysis**: `/memories/repo/AUTH_FLOW_ANALYSIS.md`

## Quick Reference

### Backend

- **Auth Service**: `backend/src/modules/auth/auth.service.ts`
  - `sendRegisterOtp()` - Initiates registration
  - `verifyRegisterOtp()` - Creates user account
  - `sendLoginOtp()` - Sends login OTP
  - `verifyLoginOtp()` - Verifies login OTP
  - `selectRole()` - User role selection
  - `refreshToken()` - Token refresh logic
  - `getMe()` - Current user info

- **Auth Controller**: `backend/src/modules/auth/auth.controller.ts`
  - All endpoints protected with guards where needed
  - Zod validation on all inputs

### Frontend

- **Login Flow**: `frontend/src/app/(auth)/login/page.tsx`
- **Register Flow**: `frontend/src/app/(auth)/signup/page.tsx`
- **OTP Verification**: `frontend/src/app/(auth)/verify-otp/page.tsx`
- **Role Selection**: `frontend/src/app/(auth)/select-role/page.tsx` (guarded)
- **Session Management**: `frontend/src/lib/auth/session.ts`
- **API Client**: `frontend/src/lib/api.ts`

## Database Schema

See: `backend/prisma/schema.prisma`

## Key Security Points

1. Passwords hashed with Argon2
2. Refresh tokens stored hashed in DB
3. Access tokens expire in 15 minutes
4. OTP expires in 10 minutes
5. Role-selection grant expires in 24 hours

## Environment Setup

See `.env.example` or ask for current configuration

---

@AGENTS.md
