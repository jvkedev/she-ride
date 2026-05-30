export type CaptainVerificationStatus =
  | "NOT_UPLOADED"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type CaptainDocumentTypeKey =
  | "driving_license"
  | "vehicle_rc"
  | "vehicle_insurance"
  | "government_id";

export type CaptainDocumentItem = {
  key: CaptainDocumentTypeKey;
  type: string;
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
  documents: CaptainDocumentItem[];
};

export async function getCaptainDocuments(): Promise<CaptainDocumentsResponse> {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/captain/documents`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load documents");
  return res.json() as Promise<CaptainDocumentsResponse>;
}

export async function uploadCaptainDocument(
  documentKey: CaptainDocumentTypeKey,
  file: File,
): Promise<CaptainDocumentsResponse> {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/captain/documents/${documentKey}`,
    {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    },
  );

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(body?.message ?? "Failed to upload document");
  }

  return res.json() as Promise<CaptainDocumentsResponse>;
}

export type CaptainVerificationSocketPayload = {
  event?: "approved" | "rejected" | "updated" | "submitted";
  message?: string;
  isVerified?: boolean;
  verificationStatus?: CaptainVerificationStatus;
  rejectionReason?: string | null;
};
