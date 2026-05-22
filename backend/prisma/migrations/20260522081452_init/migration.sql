-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('RIDER', 'CAPTAIN', 'ADMIN', 'SECURITY');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'PENDING');

-- CreateEnum
CREATE TYPE "RidePreference" AS ENUM ('QUIET', 'CHATTY', 'WOMEN_ONLY', 'PET_FRIENDLY');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('BIKE', 'AUTO', 'CAR', 'SUV');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('SEARCHING', 'ACCEPTED', 'ARRIVING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'UPI', 'WALLET');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('PHONE_VERIFICATION', 'LOGIN', 'PASSWORD_RESET', 'RIDE_START');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'RIDER',
    "gender" "Gender" NOT NULL,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileImage" TEXT,
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "defaultPickupAddress" TEXT,
    "defaultDropAddress" TEXT,
    "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ridePreference" "RidePreference",
    "safetyAlertEnabled" BOOLEAN NOT NULL DEFAULT true,
    "shareLiveLocation" BOOLEAN NOT NULL DEFAULT true,
    "totalRides" INTEGER NOT NULL DEFAULT 0,
    "cancelledRides" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "lastRideAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "captains" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "currentLatitude" DOUBLE PRECISION,
    "currentLongitude" DOUBLE PRECISION,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "captains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "captain_documents" (
    "id" TEXT NOT NULL,
    "captainId" TEXT NOT NULL,
    "aadhaarNumber" TEXT,
    "drivingLicenseNumber" TEXT,
    "aadhaarFrontImage" TEXT,
    "aadhaarBackImage" TEXT,
    "drivingLicenseImage" TEXT,
    "rcImage" TEXT,
    "selfieImage" TEXT,
    "documentStatus" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "captain_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "captainId" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "seatCapacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rides" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "captainId" TEXT,
    "pickupAddress" TEXT NOT NULL,
    "dropAddress" TEXT NOT NULL,
    "pickupLatitude" DOUBLE PRECISION NOT NULL,
    "pickupLongitude" DOUBLE PRECISION NOT NULL,
    "dropLatitude" DOUBLE PRECISION NOT NULL,
    "dropLongitude" DOUBLE PRECISION NOT NULL,
    "distanceInKm" DOUBLE PRECISION,
    "estimatedFare" DOUBLE PRECISION,
    "finalFare" DOUBLE PRECISION,
    "vehicleType" "VehicleType" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "status" "RideStatus" NOT NULL DEFAULT 'SEARCHING',
    "acceptedAt" TIMESTAMP(3),
    "arrivedAt" TIMESTAMP(3),
    "cancelledBy" "UserRole",
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "OtpType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "rideId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Rider_userId_key" ON "Rider"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "captains_userId_key" ON "captains"("userId");

-- CreateIndex
CREATE INDEX "captains_isOnline_idx" ON "captains"("isOnline");

-- CreateIndex
CREATE UNIQUE INDEX "captain_documents_captainId_key" ON "captain_documents"("captainId");

-- CreateIndex
CREATE UNIQUE INDEX "captain_documents_aadhaarNumber_key" ON "captain_documents"("aadhaarNumber");

-- CreateIndex
CREATE UNIQUE INDEX "captain_documents_drivingLicenseNumber_key" ON "captain_documents"("drivingLicenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_captainId_key" ON "vehicles"("captainId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicleNumber_key" ON "vehicles"("vehicleNumber");

-- CreateIndex
CREATE INDEX "rides_riderId_idx" ON "rides"("riderId");

-- CreateIndex
CREATE INDEX "rides_captainId_idx" ON "rides"("captainId");

-- CreateIndex
CREATE INDEX "rides_status_idx" ON "rides"("status");

-- CreateIndex
CREATE INDEX "otps_phoneNumber_idx" ON "otps"("phoneNumber");

-- CreateIndex
CREATE INDEX "otps_code_idx" ON "otps"("code");

-- AddForeignKey
ALTER TABLE "Rider" ADD CONSTRAINT "Rider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "captains" ADD CONSTRAINT "captains_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "captain_documents" ADD CONSTRAINT "captain_documents_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "captains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "captains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rides" ADD CONSTRAINT "rides_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "captains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
