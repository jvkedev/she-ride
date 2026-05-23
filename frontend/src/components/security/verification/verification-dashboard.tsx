import Link from "next/link";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { driverVerifications } from "@/lib/security/mock-data";

export default function VerificationDashboard() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {driverVerifications.map((driver) => (
        <SurfaceCard key={driver.id}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">
              {driver.name}
            </h3>
            <StatusBadge status={driver.overall} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-neutral-500">Aadhaar</dt>
              <dd><StatusBadge status={driver.aadhaar} className="mt-1" /></dd>
            </div>
            <div>
              <dt className="text-neutral-500">License</dt>
              <dd><StatusBadge status={driver.license} className="mt-1" /></dd>
            </div>
            <div>
              <dt className="text-neutral-500">Insurance</dt>
              <dd><StatusBadge status={driver.insurance} className="mt-1" /></dd>
            </div>
            <div>
              <dt className="text-neutral-500">Selfie</dt>
              <dd><StatusBadge status={driver.selfie} className="mt-1" /></dd>
            </div>
          </dl>
          <div className="mt-4 flex gap-2">
            <Button className="h-9 flex-1 rounded-lg">Approve</Button>
            <Button variant="outline" className="h-9 flex-1 rounded-lg">
              Reject
            </Button>
            <Button variant="ghost" className="h-9 rounded-lg" asChild>
              <Link href={`/admin/drivers/${driver.id}`}>Details</Link>
            </Button>
          </div>
        </SurfaceCard>
      ))}
    </div>
  );
}
