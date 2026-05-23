import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { dashboardHeading } from "@/lib/dashboard/styles";
import type { AdminDriver } from "@/lib/admin/types";

const docs = [
  { name: "Driving license", status: "approved" as const },
  { name: "RC / Registration", status: "approved" as const },
  { name: "Aadhaar", status: "pending" as const },
  { name: "Selfie verification", status: "pending" as const },
];

type DriverKycPanelProps = {
  driver: AdminDriver;
};

export default function DriverKycPanel({ driver }: DriverKycPanelProps) {
  return (
    <SurfaceCard>
      <div className="flex items-center justify-between">
        <h2 className={dashboardHeading}>KYC verification</h2>
        <StatusBadge status={driver.kycStatus} />
      </div>
      <ul className="mt-4 space-y-3">
        {docs.map((doc) => (
          <li
            key={doc.name}
            className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-3"
          >
            <div className="flex items-center gap-3">
              <FileText className="size-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-900">{doc.name}</span>
            </div>
            {doc.status === "approved" ? (
              <CheckCircle2 className="size-4 text-emerald-600" />
            ) : doc.status === "pending" ? (
              <Clock className="size-4 text-amber-600" />
            ) : (
              <XCircle className="size-4 text-red-600" />
            )}
          </li>
        ))}
      </ul>
      {driver.kycStatus === "pending" ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button className="h-10 rounded-lg">Approve driver</Button>
          <Button variant="outline" className="h-10 rounded-lg">
            Reject
          </Button>
        </div>
      ) : null}
    </SurfaceCard>
  );
}
