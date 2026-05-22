import { CheckCircle2, Clock } from "lucide-react";

import CaptainCard from "@/components/captain/shared/captain-card";
import { captainHeading } from "@/lib/captain/captain-styles";
import { cn } from "@/lib/utils";

const documents = [
  { name: "Driving license", status: "verified" as const },
  { name: "RC / Registration", status: "verified" as const },
  { name: "Aadhaar", status: "verified" as const },
  { name: "Selfie verification", status: "pending" as const },
];

export default function VerificationStatus() {
  return (
    <CaptainCard>
      <h2 className={captainHeading}>Verification status</h2>
      <ul className="mt-4 space-y-3">
        {documents.map((doc) => (
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
                doc.status === "verified"
                  ? "text-emerald-600"
                  : "text-amber-600",
              )}
            >
              {doc.status === "verified" ? (
                <CheckCircle2 className="size-3.5" />
              ) : (
                <Clock className="size-3.5" />
              )}
              {doc.status === "verified" ? "Verified" : "Pending"}
            </span>
          </li>
        ))}
      </ul>
    </CaptainCard>
  );
}
