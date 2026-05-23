import Link from "next/link";
import { notFound } from "next/navigation";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { adminRides, adminRiders } from "@/lib/admin/mock-data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminRiderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const rider = adminRiders.find((r) => r.id === id);

  if (!rider) {
    notFound();
  }

  return (
    <DashboardPageLayout
      title={rider.name}
      description={`Member since ${rider.joinedAt}`}
      actions={
        <>
          <Button variant="destructive" className="rounded-lg">
            {rider.status === "active" ? "Block rider" : "Unblock rider"}
          </Button>
          <Button variant="outline" className="rounded-lg" asChild>
            <Link href="/admin/riders">Back</Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-neutral-200 text-2xl font-bold">
            {rider.name.charAt(0)}
          </div>
          <h2 className="mt-4 text-xl font-semibold">{rider.name}</h2>
          <p className="text-sm text-neutral-500">{rider.email}</p>
          <div className="mt-4">
            <StatusBadge status={rider.status} />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 text-sm">
            <div>
              <dt className="text-neutral-500">Phone</dt>
              <dd className="font-medium">{rider.phone}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Total rides</dt>
              <dd className="font-medium">{rider.totalRides}</dd>
            </div>
          </dl>
        </SurfaceCard>
        <SurfaceCard>
          <h2 className="text-sm font-semibold text-neutral-900">Recent rides</h2>
          <ul className="mt-4 space-y-3">
            {adminRides.slice(0, 3).map((ride) => (
              <li
                key={ride.id}
                className="flex justify-between rounded-lg border border-neutral-100 px-3 py-2.5 text-sm"
              >
                <span>{ride.id}</span>
                <span className="font-medium">₹{ride.fare}</span>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      </div>
    </DashboardPageLayout>
  );
}
