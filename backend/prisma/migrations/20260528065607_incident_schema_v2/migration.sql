/*
  Warnings:

  - You are about to drop the column `evidence` on the `incidents` table. All the data in the column will be lost.
  - You are about to drop the column `resolutionNote` on the `incidents` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[incidentNumber]` on the table `incidents` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `incidentNumber` to the `incidents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reporterRole` to the `incidents` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IncidentPriority" AS ENUM ('P1', 'P2', 'P3', 'P4');

-- CreateEnum
CREATE TYPE "IncidentSource" AS ENUM ('APP', 'SOS_AUTO', 'ADMIN_MANUAL', 'SYSTEM');

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "channel" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "newData" JSONB,
ADD COLUMN     "previousData" JSONB,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "incidents" DROP COLUMN "evidence",
DROP COLUMN "resolutionNote",
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "duplicateOf" TEXT,
ADD COLUMN     "firstResponseAt" TIMESTAMP(3),
ADD COLUMN     "incidentNumber" TEXT NOT NULL,
ADD COLUMN     "priority" "IncidentPriority" NOT NULL DEFAULT 'P3',
ADD COLUMN     "reporterRole" "UserRole" NOT NULL,
ADD COLUMN     "resolvedBy" TEXT,
ADD COLUMN     "slaBreachedAt" TIMESTAMP(3),
ADD COLUMN     "slaDeadline" TIMESTAMP(3),
ADD COLUMN     "source" "IncidentSource" NOT NULL DEFAULT 'APP',
ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "incident_notes" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_evidence" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSizeKb" INTEGER NOT NULL,
    "fileHash" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "incident_notes_incidentId_idx" ON "incident_notes"("incidentId");

-- CreateIndex
CREATE INDEX "incident_evidence_incidentId_idx" ON "incident_evidence"("incidentId");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_incidentNumber_key" ON "incidents"("incidentNumber");

-- CreateIndex
CREATE INDEX "incidents_priority_idx" ON "incidents"("priority");

-- CreateIndex
CREATE INDEX "incidents_severity_createdAt_idx" ON "incidents"("severity", "createdAt");

-- CreateIndex
CREATE INDEX "incidents_reportedBy_idx" ON "incidents"("reportedBy");

-- CreateIndex
CREATE INDEX "incidents_assignedTo_idx" ON "incidents"("assignedTo");

-- CreateIndex
CREATE INDEX "incidents_incidentNumber_idx" ON "incidents"("incidentNumber");

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_duplicateOf_fkey" FOREIGN KEY ("duplicateOf") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_notes" ADD CONSTRAINT "incident_notes_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_notes" ADD CONSTRAINT "incident_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_evidence" ADD CONSTRAINT "incident_evidence_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_evidence" ADD CONSTRAINT "incident_evidence_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
