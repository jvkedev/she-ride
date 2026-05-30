-- CreateEnum
CREATE TYPE "CaptainReportCategory" AS ENUM ('UNSAFE_DRIVING', 'HARASSMENT', 'INAPPROPRIATE_BEHAVIOR', 'VEHICLE_ISSUE', 'ROUTE_ISSUE', 'FRAUD_OVERCHARGING', 'LATE_ARRIVAL', 'OTHER');

-- CreateEnum
CREATE TYPE "CaptainReportStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "SupportTicketCategory" AS ENUM ('RIDE_ISSUE', 'PAYMENT', 'ACCOUNT', 'SAFETY', 'APP_BUG', 'OTHER');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- AlterTable
ALTER TABLE "Rider" ADD COLUMN IF NOT EXISTS "defaultPaymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH';
ALTER TABLE "Rider" ADD COLUMN IF NOT EXISTS "notifyRideUpdates" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE IF NOT EXISTS "captain_reports" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "captainId" TEXT NOT NULL,
    "category" "CaptainReportCategory" NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "status" "CaptainReportStatus" NOT NULL DEFAULT 'OPEN',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "captain_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "support_tickets" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "rideId" TEXT,
    "category" "SupportTicketCategory" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "captain_reports_rideId_riderId_key" ON "captain_reports"("rideId", "riderId");
CREATE INDEX IF NOT EXISTS "captain_reports_captainId_idx" ON "captain_reports"("captainId");
CREATE INDEX IF NOT EXISTS "captain_reports_status_idx" ON "captain_reports"("status");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "captain_reports" ADD CONSTRAINT "captain_reports_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "captain_reports" ADD CONSTRAINT "captain_reports_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "captain_reports" ADD CONSTRAINT "captain_reports_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "captains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
