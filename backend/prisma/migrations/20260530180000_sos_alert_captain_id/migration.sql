-- AlterTable
ALTER TABLE "sos_alerts" ADD COLUMN "captainId" TEXT;

-- CreateIndex
CREATE INDEX "sos_alerts_captainId_idx" ON "sos_alerts"("captainId");

-- AddForeignKey
ALTER TABLE "sos_alerts" ADD CONSTRAINT "sos_alerts_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "captains"("id") ON DELETE SET NULL ON UPDATE CASCADE;
