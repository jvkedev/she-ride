import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CaptainDocumentType,
  CaptainVerificationStatus,
  DocumentStatus,
} from '@prisma/client';

import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RideRedisService } from '../redis/ride-redis.service';
import {
  computeAggregateDocumentStatus,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPE_TO_API_KEY,
  parseDocumentApiKey,
  REQUIRED_DOCUMENT_TYPES,
  toDashboardStatus,
} from './captain-verification.constants';

export type CaptainDocumentItemResponse = {
  key: string;
  type: CaptainDocumentType;
  label: string;
  documentUrl: string | null;
  uploadedAt: string | null;
  verificationStatus: CaptainVerificationStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
};

export type CaptainDocumentsResponse = {
  isVerified: boolean;
  allApproved: boolean;
  documents: CaptainDocumentItemResponse[];
};

@Injectable()
export class CaptainVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly rideRedis: RideRedisService,
  ) {}

  async ensureDocumentBundle(captainId: string) {
    let document = await this.prisma.captainDocument.findUnique({
      where: { captainId },
      include: { items: true },
    });

    if (!document) {
      document = await this.prisma.captainDocument.create({
        data: { captainId },
        include: { items: true },
      });
    }

    await this.ensureDocumentItems(document.id, document);

    return this.prisma.captainDocument.findUniqueOrThrow({
      where: { id: document.id },
      include: { items: true },
    });
  }

  private async ensureDocumentItems(
    documentId: string,
    legacy: {
      drivingLicenseImage?: string | null;
      rcImage?: string | null;
      aadhaarFrontImage?: string | null;
      documentStatus: DocumentStatus;
      rejectionReason?: string | null;
      uploadedAt: Date;
      verifiedAt?: Date | null;
      items: { documentType: CaptainDocumentType }[];
    },
  ) {
    const existingTypes = new Set(legacy.items.map((i) => i.documentType));

    for (const documentType of REQUIRED_DOCUMENT_TYPES) {
      if (existingTypes.has(documentType)) continue;

      const legacyUrl = this.legacyUrlForType(documentType, legacy);
      const hasUrl = !!legacyUrl;

      await this.prisma.captainDocumentItem.create({
        data: {
          documentId,
          documentType,
          documentUrl: legacyUrl,
          uploadedAt: hasUrl ? legacy.uploadedAt : null,
          verificationStatus: hasUrl
            ? this.legacyItemStatus(legacy.documentStatus)
            : CaptainVerificationStatus.NOT_UPLOADED,
          rejectionReason:
            legacy.documentStatus === DocumentStatus.REJECTED
              ? legacy.rejectionReason
              : null,
          reviewedAt:
            legacy.documentStatus === DocumentStatus.APPROVED
              ? legacy.verifiedAt
              : null,
        },
      });
    }
  }

  private legacyUrlForType(
    type: CaptainDocumentType,
    legacy: {
      drivingLicenseImage?: string | null;
      rcImage?: string | null;
      aadhaarFrontImage?: string | null;
    },
  ): string | null {
    switch (type) {
      case CaptainDocumentType.DRIVING_LICENSE:
        return legacy?.drivingLicenseImage ?? null;
      case CaptainDocumentType.VEHICLE_RC:
        return legacy?.rcImage ?? null;
      case CaptainDocumentType.GOVERNMENT_ID:
        return legacy?.aadhaarFrontImage ?? null;
      default:
        return null;
    }
  }

  private legacyItemStatus(
    documentStatus?: DocumentStatus,
  ): CaptainVerificationStatus {
    if (documentStatus === DocumentStatus.APPROVED) {
      return CaptainVerificationStatus.APPROVED;
    }
    if (documentStatus === DocumentStatus.REJECTED) {
      return CaptainVerificationStatus.REJECTED;
    }
    return CaptainVerificationStatus.PENDING_REVIEW;
  }

  async getDocumentsForCaptain(userId: string): Promise<CaptainDocumentsResponse> {
    const captain = await this.prisma.captain.findUnique({
      where: { userId },
      select: { id: true, isVerified: true },
    });
    if (!captain) throw new NotFoundException('Captain profile not found');

    const document = await this.ensureDocumentBundle(captain.id);
    const items = this.sortItems(document.items);

    return {
      isVerified: captain.isVerified,
      allApproved: items.every(
        (i) => i.verificationStatus === CaptainVerificationStatus.APPROVED,
      ),
      documents: items.map((item) => this.mapItem(item)),
    };
  }

  async uploadDocument(
    userId: string,
    apiKey: string,
    file: Express.Multer.File,
  ): Promise<CaptainDocumentsResponse> {
    const documentType = parseDocumentApiKey(apiKey);
    if (!documentType) {
      throw new BadRequestException('Invalid document type');
    }
    if (!file) {
      throw new BadRequestException('Document file is required');
    }

    const captain = await this.prisma.captain.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!captain) throw new NotFoundException('Captain profile not found');

    const documentUrl = await this.cloudinary.uploadFile(
      file,
      `captain-documents/${captain.id}`,
    );

    const document = await this.ensureDocumentBundle(captain.id);
    const now = new Date();

    await this.prisma.captainDocumentItem.update({
      where: {
        documentId_documentType: {
          documentId: document.id,
          documentType,
        },
      },
      data: {
        documentUrl,
        uploadedAt: now,
        verificationStatus: CaptainVerificationStatus.PENDING_REVIEW,
        rejectionReason: null,
        reviewedBy: null,
        reviewedAt: null,
      },
    });

    await this.syncLegacyDocumentImages(document.id, documentType, documentUrl);
    await this.syncCaptainVerificationState(captain.id);

    await this.rideRedis.setVerificationQueueEntry(captain.id, {
      captainId: captain.id,
      userId,
      updatedAt: now.toISOString(),
      event: 'submitted',
    });

    return this.getDocumentsForCaptain(userId);
  }

  async reviewDocument(
    captainId: string,
    apiKey: string,
    status: DocumentStatus,
    reviewerUserId: string,
    rejectionReason?: string,
  ) {
    const documentType = parseDocumentApiKey(apiKey);
    if (!documentType) {
      throw new BadRequestException('Invalid document type');
    }

    const captain = await this.prisma.captain.findUnique({
      where: { id: captainId },
      include: {
        user: { select: { id: true, fullName: true } },
        vehicle: true,
        document: { include: { items: true } },
      },
    });

    if (!captain?.document) {
      throw new NotFoundException('Captain documents not found');
    }

    const item = captain.document.items.find(
      (i) => i.documentType === documentType,
    );
    if (!item?.documentUrl) {
      throw new BadRequestException('Document has not been uploaded yet');
    }

    const verificationStatus =
      status === DocumentStatus.APPROVED
        ? CaptainVerificationStatus.APPROVED
        : CaptainVerificationStatus.REJECTED;

    const now = new Date();

    await this.prisma.captainDocumentItem.update({
      where: { id: item.id },
      data: {
        verificationStatus,
        rejectionReason:
          status === DocumentStatus.REJECTED
            ? (rejectionReason ?? 'Document rejected by security review')
            : null,
        reviewedBy: reviewerUserId,
        reviewedAt: now,
      },
    });

    const syncResult = await this.syncCaptainVerificationState(captainId);

    await this.rideRedis.publishVerificationUpdate(captain.user.id, {
      event:
        syncResult.allApproved
          ? 'approved'
          : status === DocumentStatus.REJECTED
            ? 'rejected'
            : 'updated',
      isVerified: syncResult.isVerified,
      documentType,
      verificationStatus,
      rejectionReason:
        status === DocumentStatus.REJECTED
          ? (rejectionReason ?? 'Document rejected by security review')
          : null,
      message: syncResult.allApproved
        ? 'Your documents have been approved. You can now start accepting rides.'
        : status === DocumentStatus.REJECTED
          ? 'Document verification failed. Please review the rejection reason and upload a corrected document.'
          : 'Verification status updated.',
    });

    return syncResult;
  }

  async syncCaptainVerificationState(captainId: string) {
    const captain = await this.prisma.captain.findUnique({
      where: { id: captainId },
      include: {
        user: { select: { id: true } },
        vehicle: true,
        document: { include: { items: true } },
      },
    });

    if (!captain) throw new NotFoundException('Captain not found');

    const document = captain.document
      ? captain.document
      : await this.ensureDocumentBundle(captainId);

    const items = this.sortItems(document.items);
    const allApproved =
      items.length === REQUIRED_DOCUMENT_TYPES.length &&
      items.every(
        (i) => i.verificationStatus === CaptainVerificationStatus.APPROVED,
      );
    const anyRejected = items.some(
      (i) => i.verificationStatus === CaptainVerificationStatus.REJECTED,
    );
    const aggregateStatus = computeAggregateDocumentStatus(items);
    const now = new Date();

    const captainUpdate: {
      isVerified: boolean;
      verifiedAt: Date | null;
      isOnline?: boolean;
    } = {
      isVerified: allApproved,
      verifiedAt: allApproved ? (captain.verifiedAt ?? now) : null,
    };

    if (!allApproved && (anyRejected || !captain.isVerified) && captain.isOnline) {
      captainUpdate.isOnline = false;
    }

    await this.prisma.$transaction([
      this.prisma.captainDocument.update({
        where: { id: document.id },
        data: {
          documentStatus: aggregateStatus,
          rejectionReason: anyRejected
            ? (items.find(
                (i) =>
                  i.verificationStatus === CaptainVerificationStatus.REJECTED,
              )?.rejectionReason ?? null)
            : null,
          verifiedAt: allApproved ? now : null,
        },
      }),
      this.prisma.captain.update({
        where: { id: captainId },
        data: captainUpdate,
      }),
    ]);

    if (captainUpdate.isOnline === false && captain.vehicle) {
      await this.rideRedis.setCaptainOnline(
        captainId,
        captain.user.id,
        captain.currentLatitude,
        captain.currentLongitude,
        captain.vehicle.vehicleType,
        false,
      );
    }

    return {
      isVerified: allApproved,
      allApproved,
      aggregateStatus,
      items,
    };
  }

  async assertCanGoOnline(userId: string) {
    const captain = await this.prisma.captain.findUnique({
      where: { userId },
      include: { document: { include: { items: true } } },
    });
    if (!captain) throw new NotFoundException('Captain profile not found');

    if (!captain.isVerified) {
      const document = captain.document
        ? captain.document
        : await this.ensureDocumentBundle(captain.id);
      const pendingReview = document.items.some(
        (i) =>
          i.verificationStatus === CaptainVerificationStatus.PENDING_REVIEW,
      );
      const rejected = document.items.some(
        (i) => i.verificationStatus === CaptainVerificationStatus.REJECTED,
      );
      const notUploaded = document.items.some(
        (i) => i.verificationStatus === CaptainVerificationStatus.NOT_UPLOADED,
      );

      if (notUploaded || pendingReview || rejected) {
        throw new BadRequestException(
          'Your documents are still pending verification. Please wait for approval before going online.',
        );
      }

      throw new BadRequestException(
        'Your documents are still pending verification. Please wait for approval before going online.',
      );
    }
  }

  mapItemsForAdmin(
    items: {
      documentType: CaptainDocumentType;
      documentUrl: string | null;
      verificationStatus: CaptainVerificationStatus;
      rejectionReason: string | null;
      uploadedAt: Date | null;
    }[],
  ) {
    return this.sortItems(items).map((item) => ({
      key: DOCUMENT_TYPE_TO_API_KEY[item.documentType],
      label: DOCUMENT_TYPE_LABELS[item.documentType],
      number: null,
      imageUrl: item.documentUrl,
      status: toDashboardStatus(item.verificationStatus),
      verificationStatus: item.verificationStatus,
      rejectionReason: item.rejectionReason,
      uploadedAt: item.uploadedAt,
    }));
  }

  private sortItems<
    T extends { documentType: CaptainDocumentType },
  >(items: T[]): T[] {
    return [...items].sort(
      (a, b) =>
        REQUIRED_DOCUMENT_TYPES.indexOf(a.documentType) -
        REQUIRED_DOCUMENT_TYPES.indexOf(b.documentType),
    );
  }

  private mapItem(item: {
    documentType: CaptainDocumentType;
    documentUrl: string | null;
    uploadedAt: Date | null;
    verificationStatus: CaptainVerificationStatus;
    rejectionReason: string | null;
    reviewedAt: Date | null;
  }): CaptainDocumentItemResponse {
    return {
      key: DOCUMENT_TYPE_TO_API_KEY[item.documentType],
      type: item.documentType,
      label: DOCUMENT_TYPE_LABELS[item.documentType],
      documentUrl: item.documentUrl,
      uploadedAt: item.uploadedAt?.toISOString() ?? null,
      verificationStatus: item.verificationStatus,
      rejectionReason: item.rejectionReason,
      reviewedAt: item.reviewedAt?.toISOString() ?? null,
    };
  }

  private async syncLegacyDocumentImages(
    documentId: string,
    documentType: CaptainDocumentType,
    documentUrl: string,
  ) {
    const data: Record<string, string> = {};
    switch (documentType) {
      case CaptainDocumentType.DRIVING_LICENSE:
        data.drivingLicenseImage = documentUrl;
        break;
      case CaptainDocumentType.VEHICLE_RC:
        data.rcImage = documentUrl;
        break;
      case CaptainDocumentType.GOVERNMENT_ID:
        data.aadhaarFrontImage = documentUrl;
        break;
      default:
        break;
    }

    if (Object.keys(data).length > 0) {
      await this.prisma.captainDocument.update({
        where: { id: documentId },
        data,
      });
    }
  }
}
