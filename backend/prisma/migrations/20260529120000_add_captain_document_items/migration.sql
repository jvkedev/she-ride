-- CreateEnum
CREATE TYPE "CaptainDocumentType" AS ENUM ('DRIVING_LICENSE', 'VEHICLE_RC', 'VEHICLE_INSURANCE', 'GOVERNMENT_ID');

-- CreateEnum
CREATE TYPE "CaptainVerificationStatus" AS ENUM ('NOT_UPLOADED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "captain_document_items" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentType" "CaptainDocumentType" NOT NULL,
    "documentUrl" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "verificationStatus" "CaptainVerificationStatus" NOT NULL DEFAULT 'NOT_UPLOADED',
    "rejectionReason" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "captain_document_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "captain_document_items_verificationStatus_idx" ON "captain_document_items"("verificationStatus");

CREATE UNIQUE INDEX "captain_document_items_documentId_documentType_key" ON "captain_document_items"("documentId", "documentType");

ALTER TABLE "captain_document_items" ADD CONSTRAINT "captain_document_items_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "captain_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "captain_document_items" (
    "id", "documentId", "documentType", "documentUrl", "uploadedAt",
    "verificationStatus", "rejectionReason", "reviewedAt", "createdAt", "updatedAt"
)
SELECT
    cd."id" || '_dl',
    cd."id",
    'DRIVING_LICENSE',
    cd."drivingLicenseImage",
    CASE WHEN cd."drivingLicenseImage" IS NOT NULL THEN cd."uploadedAt" ELSE NULL END,
    CASE
        WHEN cd."drivingLicenseImage" IS NULL THEN 'NOT_UPLOADED'::"CaptainVerificationStatus"
        WHEN cd."documentStatus" = 'APPROVED' THEN 'APPROVED'::"CaptainVerificationStatus"
        WHEN cd."documentStatus" = 'REJECTED' THEN 'REJECTED'::"CaptainVerificationStatus"
        ELSE 'PENDING_REVIEW'::"CaptainVerificationStatus"
    END,
    CASE WHEN cd."documentStatus" = 'REJECTED' THEN cd."rejectionReason" ELSE NULL END,
    CASE WHEN cd."documentStatus" = 'APPROVED' THEN cd."verifiedAt" ELSE NULL END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "captain_documents" cd
WHERE NOT EXISTS (
    SELECT 1 FROM "captain_document_items" i
    WHERE i."documentId" = cd."id" AND i."documentType" = 'DRIVING_LICENSE'
);

INSERT INTO "captain_document_items" (
    "id", "documentId", "documentType", "documentUrl", "uploadedAt",
    "verificationStatus", "rejectionReason", "reviewedAt", "createdAt", "updatedAt"
)
SELECT
    cd."id" || '_rc',
    cd."id",
    'VEHICLE_RC',
    cd."rcImage",
    CASE WHEN cd."rcImage" IS NOT NULL THEN cd."uploadedAt" ELSE NULL END,
    CASE
        WHEN cd."rcImage" IS NULL THEN 'NOT_UPLOADED'::"CaptainVerificationStatus"
        WHEN cd."documentStatus" = 'APPROVED' THEN 'APPROVED'::"CaptainVerificationStatus"
        WHEN cd."documentStatus" = 'REJECTED' THEN 'REJECTED'::"CaptainVerificationStatus"
        ELSE 'PENDING_REVIEW'::"CaptainVerificationStatus"
    END,
    CASE WHEN cd."documentStatus" = 'REJECTED' THEN cd."rejectionReason" ELSE NULL END,
    CASE WHEN cd."documentStatus" = 'APPROVED' THEN cd."verifiedAt" ELSE NULL END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "captain_documents" cd
WHERE NOT EXISTS (
    SELECT 1 FROM "captain_document_items" i
    WHERE i."documentId" = cd."id" AND i."documentType" = 'VEHICLE_RC'
);

INSERT INTO "captain_document_items" (
    "id", "documentId", "documentType", "documentUrl", "uploadedAt",
    "verificationStatus", "rejectionReason", "reviewedAt", "createdAt", "updatedAt"
)
SELECT
    cd."id" || '_ins',
    cd."id",
    'VEHICLE_INSURANCE',
    NULL,
    NULL,
    'NOT_UPLOADED'::"CaptainVerificationStatus",
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "captain_documents" cd
WHERE NOT EXISTS (
    SELECT 1 FROM "captain_document_items" i
    WHERE i."documentId" = cd."id" AND i."documentType" = 'VEHICLE_INSURANCE'
);

INSERT INTO "captain_document_items" (
    "id", "documentId", "documentType", "documentUrl", "uploadedAt",
    "verificationStatus", "rejectionReason", "reviewedAt", "createdAt", "updatedAt"
)
SELECT
    cd."id" || '_gov',
    cd."id",
    'GOVERNMENT_ID',
    COALESCE(cd."aadhaarFrontImage", cd."aadhaarBackImage"),
    CASE WHEN COALESCE(cd."aadhaarFrontImage", cd."aadhaarBackImage") IS NOT NULL THEN cd."uploadedAt" ELSE NULL END,
    CASE
        WHEN COALESCE(cd."aadhaarFrontImage", cd."aadhaarBackImage") IS NULL THEN 'NOT_UPLOADED'::"CaptainVerificationStatus"
        WHEN cd."documentStatus" = 'APPROVED' THEN 'APPROVED'::"CaptainVerificationStatus"
        WHEN cd."documentStatus" = 'REJECTED' THEN 'REJECTED'::"CaptainVerificationStatus"
        ELSE 'PENDING_REVIEW'::"CaptainVerificationStatus"
    END,
    CASE WHEN cd."documentStatus" = 'REJECTED' THEN cd."rejectionReason" ELSE NULL END,
    CASE WHEN cd."documentStatus" = 'APPROVED' THEN cd."verifiedAt" ELSE NULL END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "captain_documents" cd
WHERE NOT EXISTS (
    SELECT 1 FROM "captain_document_items" i
    WHERE i."documentId" = cd."id" AND i."documentType" = 'GOVERNMENT_ID'
);

UPDATE "captains" c
SET "isVerified" = true,
    "verifiedAt" = cd."verifiedAt"
FROM "captain_documents" cd
WHERE cd."captainId" = c."id"
  AND cd."documentStatus" = 'APPROVED'
  AND c."isVerified" = false;
