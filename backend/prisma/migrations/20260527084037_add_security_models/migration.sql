-- CreateEnum
CREATE TYPE "SosStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'FALSE_ALARM');

-- CreateEnum
CREATE TYPE "SosTriggerType" AS ENUM ('BUTTON_PRESS', 'AUTO_DETECTED', 'VOICE');

-- CreateEnum
CREATE TYPE "FraudType" AS ENUM ('FAKE_PAYMENT', 'PROMO_ABUSE', 'ACCOUNT_TAKEOVER', 'ROUTE_MANIPULATION', 'FAKE_RATING', 'IDENTITY_FRAUD', 'MULTIPLE_ACCOUNTS');

-- CreateEnum
CREATE TYPE "FraudRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FraudStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'FALSE_POSITIVE');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('HARASSMENT', 'ASSAULT', 'THEFT', 'ACCIDENT', 'UNSAFE_DRIVING', 'ROUTE_DEVIATION', 'OTHER');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "EmergencyType" AS ENUM ('POLICE', 'AMBULANCE', 'FIRE');

-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('DISPATCHED', 'ON_THE_WAY', 'ARRIVED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('SOS_CREATED', 'SOS_RESOLVED', 'FRAUD_FLAGGED', 'FRAUD_RESOLVED', 'USER_BLOCKED', 'USER_UNBLOCKED', 'DRIVER_VERIFIED', 'DRIVER_REJECTED', 'INCIDENT_CREATED', 'INCIDENT_RESOLVED', 'RISK_ZONE_ADDED', 'RISK_ZONE_REMOVED', 'EMERGENCY_DISPATCHED');

-- CreateTable
CREATE TABLE "sos_alerts" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "rideId" TEXT,
    "triggerType" "SosTriggerType" NOT NULL,
    "status" "SosStatus" NOT NULL DEFAULT 'ACTIVE',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "handledBy" TEXT,
    "handledAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sos_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sos_location_snapshots" (
    "id" TEXT NOT NULL,
    "sosAlertId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sos_location_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_cases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rideId" TEXT,
    "fraudType" "FraudType" NOT NULL,
    "riskLevel" "FraudRiskLevel" NOT NULL,
    "fraudScore" DOUBLE PRECISION NOT NULL,
    "status" "FraudStatus" NOT NULL DEFAULT 'OPEN',
    "evidence" JSONB,
    "description" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fraud_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_signals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signalType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    "rideId" TEXT,
    "incidentType" "IncidentType" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "evidence" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" TEXT,
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suspicious_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reasons" TEXT[],
    "riskScore" DOUBLE PRECISION NOT NULL,
    "flaggedBy" TEXT,
    "flaggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suspicious_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "centerLatitude" DOUBLE PRECISION NOT NULL,
    "centerLongitude" DOUBLE PRECISION NOT NULL,
    "radiusInMeters" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_behavior_flags" (
    "id" TEXT NOT NULL,
    "captainId" TEXT NOT NULL,
    "rideId" TEXT,
    "flagType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "driver_behavior_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "sosAlertId" TEXT,
    "fraudCaseId" TEXT,
    "incidentId" TEXT,
    "suspiciousAccountId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_dispatches" (
    "id" TEXT NOT NULL,
    "sosAlertId" TEXT NOT NULL,
    "emergencyType" "EmergencyType" NOT NULL,
    "status" "EmergencyStatus" NOT NULL DEFAULT 'DISPATCHED',
    "dispatchedBy" TEXT NOT NULL,
    "dispatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arrivedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "emergency_dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sos_alerts_riderId_idx" ON "sos_alerts"("riderId");

-- CreateIndex
CREATE INDEX "sos_alerts_status_idx" ON "sos_alerts"("status");

-- CreateIndex
CREATE INDEX "sos_location_snapshots_sosAlertId_idx" ON "sos_location_snapshots"("sosAlertId");

-- CreateIndex
CREATE INDEX "fraud_cases_userId_idx" ON "fraud_cases"("userId");

-- CreateIndex
CREATE INDEX "fraud_cases_status_idx" ON "fraud_cases"("status");

-- CreateIndex
CREATE INDEX "fraud_cases_riskLevel_idx" ON "fraud_cases"("riskLevel");

-- CreateIndex
CREATE INDEX "fraud_signals_userId_idx" ON "fraud_signals"("userId");

-- CreateIndex
CREATE INDEX "incidents_status_idx" ON "incidents"("status");

-- CreateIndex
CREATE INDEX "incidents_severity_idx" ON "incidents"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "suspicious_accounts_userId_key" ON "suspicious_accounts"("userId");

-- CreateIndex
CREATE INDEX "suspicious_accounts_isResolved_idx" ON "suspicious_accounts"("isResolved");

-- CreateIndex
CREATE INDEX "risk_zones_isActive_idx" ON "risk_zones"("isActive");

-- CreateIndex
CREATE INDEX "driver_behavior_flags_captainId_idx" ON "driver_behavior_flags"("captainId");

-- CreateIndex
CREATE INDEX "driver_behavior_flags_isReviewed_idx" ON "driver_behavior_flags"("isReviewed");

-- CreateIndex
CREATE INDEX "audit_logs_performedBy_idx" ON "audit_logs"("performedBy");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "emergency_dispatches_sosAlertId_idx" ON "emergency_dispatches"("sosAlertId");

-- AddForeignKey
ALTER TABLE "sos_alerts" ADD CONSTRAINT "sos_alerts_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sos_alerts" ADD CONSTRAINT "sos_alerts_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sos_location_snapshots" ADD CONSTRAINT "sos_location_snapshots_sosAlertId_fkey" FOREIGN KEY ("sosAlertId") REFERENCES "sos_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_cases" ADD CONSTRAINT "fraud_cases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_cases" ADD CONSTRAINT "fraud_cases_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_signals" ADD CONSTRAINT "fraud_signals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suspicious_accounts" ADD CONSTRAINT "suspicious_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_behavior_flags" ADD CONSTRAINT "driver_behavior_flags_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "captains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_behavior_flags" ADD CONSTRAINT "driver_behavior_flags_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "rides"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_sosAlertId_fkey" FOREIGN KEY ("sosAlertId") REFERENCES "sos_alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_fraudCaseId_fkey" FOREIGN KEY ("fraudCaseId") REFERENCES "fraud_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_suspiciousAccountId_fkey" FOREIGN KEY ("suspiciousAccountId") REFERENCES "suspicious_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_dispatches" ADD CONSTRAINT "emergency_dispatches_sosAlertId_fkey" FOREIGN KEY ("sosAlertId") REFERENCES "sos_alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
