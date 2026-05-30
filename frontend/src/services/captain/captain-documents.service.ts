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

function parseApiError(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const record = body as { message?: string | string[] };
  if (Array.isArray(record.message)) return record.message.join(". ");
  if (typeof record.message === "string") return record.message;
  return null;
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
    const body = await res.json().catch(() => null);
    throw new Error(
      parseApiError(body) ?? "Failed to upload document. Try a smaller JPG/PNG under 5MB.",
    );
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
