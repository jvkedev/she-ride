"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { dashboardHeading } from "@/lib/dashboard/styles";
import { cn } from "@/lib/utils";
import type { AdminDriverDetail } from "@/lib/admin/types";

const rejectionReasons = {
  driving_license: "Driving license is invalid or expired.",
  vehicle_rc: "Vehicle registration certificate is invalid or unreadable.",
  vehicle_insurance: "Vehicle insurance document is invalid or expired.",
  government_id: "Government ID is invalid or does not match the profile.",
} as const;

type DriverDocumentKey = AdminDriverDetail["documents"][number]["key"];
type DocumentReviewStatus = AdminDriverDetail["documents"][number]["status"];

type DriverKycPanelProps = {
  driver: AdminDriverDetail;
  onReview: (payload: {
    documentKey: DriverDocumentKey;
    status: "APPROVED" | "REJECTED";
    rejectionReason?: string;
  }) => Promise<void>;
  loading?: boolean;
};

const statusIconClasses: Record<DocumentReviewStatus, string> = {
  approved: "text-emerald-600",
  pending: "text-amber-600",
  rejected: "text-red-600",
};

const statusIcons: Record<DocumentReviewStatus, LucideIcon> = {
  approved: CheckCircle2,
  pending: Clock,
  rejected: XCircle,
};

function buildStatusMap(documents: AdminDriverDetail["documents"]) {
  return documents.reduce(
    (acc, document) => {
      acc[document.key] = document.status;
      return acc;
    },
    {} as Record<DriverDocumentKey, DocumentReviewStatus>,
  );
}

export default function DriverKycPanel({
  driver,
  onReview,
  loading = false,
}: DriverKycPanelProps) {
  const [documentStatuses, setDocumentStatuses] = useState<
    Record<DriverDocumentKey, DocumentReviewStatus>
  >(() => buildStatusMap(driver.documents));

  const [selectedDocKey, setSelectedDocKey] = useState<
    DriverDocumentKey | undefined
  >(() =>
    driver.documents.find((document) => document.status === "pending")?.key,
  );

  useEffect(() => {
    setDocumentStatuses(buildStatusMap(driver.documents));
  }, [driver.documents]);

  const getStatus = (key: DriverDocumentKey) =>
    documentStatuses[key] ??
    driver.documents.find((document) => document.key === key)?.status ??
    "pending";

  const pendingDocuments = useMemo(
    () =>
      driver.documents.filter(
        (document) => getStatus(document.key) === "pending",
      ),
    [driver.documents, documentStatuses],
  );

  useEffect(() => {
    if (pendingDocuments.length === 0) {
      setSelectedDocKey(undefined);
      return;
    }

    const selectedStillPending = pendingDocuments.some(
      (document) => document.key === selectedDocKey,
    );

    if (!selectedStillPending) {
      setSelectedDocKey(pendingDocuments[0]?.key);
    }
  }, [pendingDocuments, selectedDocKey]);

  const selectedDocument = useMemo(
    () => pendingDocuments.find((document) => document.key === selectedDocKey),
    [pendingDocuments, selectedDocKey],
  );

  const handleReview = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedDocument) return;

    const rejectionReason =
      status === "REJECTED"
        ? rejectionReasons[selectedDocument.key] ??
          "Document rejected by security review."
        : undefined;

    await onReview({
      documentKey: selectedDocument.key,
      status,
      rejectionReason,
    });

    setDocumentStatuses((current) => ({
      ...current,
      [selectedDocument.key]:
        status === "APPROVED" ? "approved" : "rejected",
    }));
  };

  const allReviewed = pendingDocuments.length === 0;

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between gap-3">
        <h2 className={dashboardHeading}>KYC verification</h2>
        <StatusBadge status={driver.documentStatus} />
      </div>

      <div className="mt-4 space-y-4">
        {allReviewed ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-10 text-center">
            <CheckCircle2 className="size-8 text-emerald-600" />
            <p className="text-sm font-semibold text-neutral-900">
              All documents reviewed
            </p>
            <p className="max-w-xs text-xs text-neutral-500">
              There are no pending documents left in this queue. Status updates
              are reflected in the submitted documents list.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Review document
              </p>
              <p className="text-xs text-neutral-500">
                Select a pending document below, then approve or reject it.
                Reviewed documents are removed from this queue.
              </p>
            </div>

            <div className="space-y-3">
              {pendingDocuments.map((document) => {
                const isSelected = document.key === selectedDocument?.key;

                return (
                  <button
                    key={document.key}
                    type="button"
                    onClick={() => setSelectedDocKey(document.key)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
                      isSelected
                        ? "border-pink-200 bg-pink-50/50 shadow-sm"
                        : "border-neutral-100 bg-white hover:border-pink-200 hover:bg-neutral-50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-xl border",
                          isSelected
                            ? "border-pink-200 bg-white text-pink-500"
                            : "border-neutral-200 bg-neutral-50 text-neutral-500",
                        )}
                      >
                        <FileText className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {document.label}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {document.number ?? "No number submitted"}
                        </p>
                      </div>
                    </div>

                    <Clock className="size-4 text-amber-600" />
                  </button>
                );
              })}
            </div>

            {selectedDocument ? (
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900">
                      {selectedDocument.label}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Review the selected document and update its verification
                      state.
                    </p>
                  </div>
                  <StatusBadge status="pending" />
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-white px-3 py-3">
                    <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      Number
                    </dt>
                    <dd className="mt-1 font-mono text-sm text-neutral-900">
                      {selectedDocument.number ?? "-"}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-white px-3 py-3">
                    <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      File
                    </dt>
                    <dd className="mt-1 text-sm text-neutral-900">
                      {selectedDocument.imageUrl ? (
                        <a
                          href={selectedDocument.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
                        >
                          <FileText className="size-4" />
                          Open uploaded file
                        </a>
                      ) : (
                        "No file uploaded"
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex gap-2">
                  <Button
                    className="h-12 flex-1 rounded-xl bg-[#ff2d6f] text-white hover:bg-[#ff1f60]"
                    onClick={() => handleReview("APPROVED")}
                    disabled={loading || !selectedDocument.imageUrl}
                  >
                    Approve document
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 flex-1 rounded-xl border-pink-200 bg-pink-50/40 text-neutral-900 hover:bg-pink-50"
                    onClick={() => handleReview("REJECTED")}
                    disabled={loading || !selectedDocument.imageUrl}
                  >
                    Reject document
                  </Button>
                </div>

                <p className="mt-3 text-xs text-neutral-500">
                  Applies to {selectedDocument.label}. Once reviewed, it will
                  be removed from this panel.
                </p>
              </div>
            ) : null}
          </>
        )}

        {driver.rejectionReason ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-xs text-red-700">
            <span className="font-medium">Latest rejection reason:</span>{" "}
            {driver.rejectionReason}
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
