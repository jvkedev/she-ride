import Link from "next/link";
import { notFound } from "next/navigation";

import DriverKycPanel from "@/components/admin/drivers/driver-kyc-panel";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { adminDrivers } from "@/lib/admin/mock-data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminDriverDetailPage({ params }: PageProps) {
  const { id } = await params;
  const driver = adminDrivers.find((d) => d.id === id);

  if (!driver) {
    notFound();
  }

  return (
    <DashboardPageLayout
      title={driver.name}
      description={`Captain since ${driver.joinedAt}`}
      actions={
        <Button variant="outline" className="rounded-lg" asChild>
          <Link href="/admin/drivers">Back to drivers</Link>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Profile</h2>
            <StatusBadge status={driver.status} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-neutral-500">Phone</dt>
              <dd className="font-medium">{driver.phone}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Vehicle</dt>
              <dd className="font-medium">{driver.vehicle}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Plate</dt>
              <dd className="font-medium">{driver.plate}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Trips</dt>
              <dd className="font-medium">{driver.trips}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Rating</dt>
              <dd className="font-medium">
                {driver.rating > 0 ? driver.rating : "—"}
              </dd>
            </div>
          </dl>
        </SurfaceCard>
        <DriverKycPanel driver={driver} />
      </div>
    </DashboardPageLayout>
  );
}
