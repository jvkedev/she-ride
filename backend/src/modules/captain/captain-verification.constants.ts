import {
  CaptainDocumentType,
  CaptainVerificationStatus,
  DocumentStatus,
} from '@prisma/client';

export const REQUIRED_DOCUMENT_TYPES: CaptainDocumentType[] = [
  CaptainDocumentType.DRIVING_LICENSE,
  CaptainDocumentType.VEHICLE_RC,
  CaptainDocumentType.VEHICLE_INSURANCE,
  CaptainDocumentType.GOVERNMENT_ID,
];

export const DOCUMENT_TYPE_LABELS: Record<CaptainDocumentType, string> = {
  [CaptainDocumentType.DRIVING_LICENSE]: 'Driving License',
  [CaptainDocumentType.VEHICLE_RC]: 'Vehicle Registration Certificate (RC)',
  [CaptainDocumentType.VEHICLE_INSURANCE]: 'Vehicle Insurance',
  [CaptainDocumentType.GOVERNMENT_ID]: 'Government ID (Aadhaar/PAN)',
};

export const DOCUMENT_API_KEYS = {
  driving_license: CaptainDocumentType.DRIVING_LICENSE,
  vehicle_rc: CaptainDocumentType.VEHICLE_RC,
  vehicle_insurance: CaptainDocumentType.VEHICLE_INSURANCE,
  government_id: CaptainDocumentType.GOVERNMENT_ID,
} as const;

export type DocumentApiKey = keyof typeof DOCUMENT_API_KEYS;

export const DOCUMENT_TYPE_TO_API_KEY: Record<CaptainDocumentType, DocumentApiKey> =
  {
    [CaptainDocumentType.DRIVING_LICENSE]: 'driving_license',
    [CaptainDocumentType.VEHICLE_RC]: 'vehicle_rc',
    [CaptainDocumentType.VEHICLE_INSURANCE]: 'vehicle_insurance',
    [CaptainDocumentType.GOVERNMENT_ID]: 'government_id',
  };

export function parseDocumentApiKey(key: string): CaptainDocumentType | null {
  return DOCUMENT_API_KEYS[key as DocumentApiKey] ?? null;
}

export function toDashboardStatus(
  status: CaptainVerificationStatus,
): 'approved' | 'pending' | 'rejected' {
  if (status === CaptainVerificationStatus.APPROVED) return 'approved';
  if (status === CaptainVerificationStatus.REJECTED) return 'rejected';
  return 'pending';
}

export function computeAggregateDocumentStatus(
  items: { verificationStatus: CaptainVerificationStatus }[],
): DocumentStatus {
  if (
    items.length > 0 &&
    items.every((i) => i.verificationStatus === CaptainVerificationStatus.APPROVED)
  ) {
    return DocumentStatus.APPROVED;
  }
  if (items.some((i) => i.verificationStatus === CaptainVerificationStatus.REJECTED)) {
    return DocumentStatus.REJECTED;
  }
  return DocumentStatus.PENDING;
}

export function computeKycStatus(
  items: { verificationStatus: CaptainVerificationStatus }[],
  isVerified: boolean,
): 'approved' | 'pending' | 'rejected' {
  if (isVerified) return 'approved';
  if (items.some((i) => i.verificationStatus === CaptainVerificationStatus.REJECTED)) {
    return 'rejected';
  }
  if (
    items.some(
      (i) => i.verificationStatus === CaptainVerificationStatus.PENDING_REVIEW,
    )
  ) {
    return 'pending';
  }
  if (
    items.some(
      (i) => i.verificationStatus === CaptainVerificationStatus.NOT_UPLOADED,
    )
  ) {
    return 'pending';
  }
  return 'pending';
}
