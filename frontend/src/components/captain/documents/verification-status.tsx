"use client";

import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";

import CaptainCard from "@/components/captain/shared/captain-card";
import { captainHeading } from "@/lib/captain/captain-styles";
import { cn } from "@/lib/utils";
import {
  useCaptainDocuments,
  type DocumentStatus,
} from "@/hooks/captain/use-captain-documents";

type StatusConfig = {
  label: string;
  className: string;
  Icon: React.ElementType;
};

const statusConfig: Record<DocumentStatus, StatusConfig> = {
  verified: {
    label: "Verified",
    className: "text-emerald-600",
    Icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className: "text-amber-600",
    Icon: Clock,
  },
  rejected: {
    label: "Rejected",
    className: "text-red-500",
    Icon: XCircle,
  },
};

export default function VerificationStatus() {
  const { documents, loading, error } = useCaptainDocuments();

  return (
    <CaptainCard>
      <h2 className={captainHeading}>Verification status</h2>

      {loading && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-400">
          <Loader2 className="size-4 animate-spin" />
          Loading documents…
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {!loading && !error && (
        <ul className="mt-4 space-y-3">
          {documents.map((doc) => {
            const { label, className, Icon } =
              statusConfig[doc.status] ?? statusConfig.pending;
            return (
              <li
                key={doc.name}
                className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2.5"
              >
                <span className="text-sm font-medium text-neutral-900">
                  {doc.name}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    className,
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </CaptainCard>
  );
}
