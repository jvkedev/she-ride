"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import CaptainCard from "@/components/captain/shared/captain-card";
import { Button } from "@/components/ui/button";
import { captainHeading } from "@/lib/captain/captain-styles";
import { cn } from "@/lib/utils";
import {
  useCaptainDocuments,
  useInvalidateCaptainDocuments,
  type CaptainVerificationStatus,
} from "@/hooks/captain/use-captain-documents";
import {
  uploadCaptainDocument,
  type CaptainDocumentTypeKey,
} from "@/services/captain/captain-documents.service";
import { compressDocumentFile } from "@/lib/upload/compress-document-file";

type StatusConfig = {
  label: string;
  className: string;
  Icon: React.ElementType;
};

const statusConfig: Record<CaptainVerificationStatus, StatusConfig> = {
  NOT_UPLOADED: {
    label: "Not uploaded",
    className: "text-neutral-500",
    Icon: Upload,
  },
  PENDING_REVIEW: {
    label: "Pending review",
    className: "text-amber-600",
    Icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    className: "text-emerald-600",
    Icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className: "text-red-500",
    Icon: XCircle,
  },
};

export default function VerificationStatus() {
  const { data, isLoading, error } = useCaptainDocuments();
  const invalidateDocuments = useInvalidateCaptainDocuments();
  const [uploadingKey, setUploadingKey] = useState<CaptainDocumentTypeKey | null>(
    null,
  );
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const showWarning = !data?.allApproved;

  const handleFileChange = async (
    key: CaptainDocumentTypeKey,
    file: File | undefined,
  ) => {
    if (!file) return;

    setUploadingKey(key);
    try {
      const prepared = await compressDocumentFile(file);
      await uploadCaptainDocument(key, prepared);
      await invalidateDocuments();
      toast.success(
        "Documents submitted successfully. Verification may take 24–48 hours. You will be notified once the review is complete.",
      );
    } catch (uploadError) {
      toast.error(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload document",
      );
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className="space-y-4">
      {showWarning && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Verification Required
            </p>
            <p className="mt-1 text-sm text-amber-800">
              Your account is not yet eligible to receive ride requests. Please
              upload all required documents for verification.
            </p>
          </div>
        </div>
      )}

      <CaptainCard>
        <h2 className={captainHeading}>Required documents</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Upload clear photos of each document. All four must be approved before
          you can go online and accept rides.
        </p>

        {isLoading && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-400">
            <Loader2 className="size-4 animate-spin" />
            Loading documents…
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-500">
            {error instanceof Error ? error.message : "Failed to load documents"}
          </p>
        )}

        {!isLoading && !error && data && (
          <ul className="mt-4 space-y-3">
            {data.documents.map((doc) => {
              const config =
                statusConfig[doc.verificationStatus] ?? statusConfig.NOT_UPLOADED;
              const { label, className, Icon } = config;
              const isUploading = uploadingKey === doc.key;
              const hasFile = !!doc.documentUrl;

              return (
                <li
                  key={doc.key}
                  className="rounded-lg border border-neutral-100 px-3 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900">
                        {doc.label}
                      </p>
                      {doc.uploadedAt && (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          Uploaded{" "}
                          {new Date(doc.uploadedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                      {doc.rejectionReason && (
                        <p className="mt-2 text-xs text-red-600">
                          {doc.rejectionReason}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        className,
                      )}
                    >
                      <Icon className="size-3.5" />
                      {label}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[doc.key] = el;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={(e) =>
                        void handleFileChange(
                          doc.key,
                          e.target.files?.[0],
                        )
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isUploading}
                      className="h-8 rounded-lg text-xs"
                      onClick={() => fileInputRefs.current[doc.key]?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      ) : (
                        <Upload className="mr-1.5 size-3.5" />
                      )}
                      {hasFile ? "Replace file" : "Upload file"}
                    </Button>
                    {hasFile && doc.documentUrl && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-lg text-xs"
                        asChild
                      >
                        <a
                          href={doc.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-1.5 size-3.5" />
                          Preview
                        </a>
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CaptainCard>
    </div>
  );
}
