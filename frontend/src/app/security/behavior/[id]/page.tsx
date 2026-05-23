import Link from "next/link";
import { notFound } from "next/navigation";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { driverBehavior } from "@/lib/security/mock-data";

type PageProps = { params: Promise<{ id: string }> };

export default async function DriverBehaviorProfilePage({ params }: PageProps) {
  const { id } = await params;
  const driver = driverBehavior.find((d) => d.id === id);
  if (!driver) notFound();

  return (
    <DashboardPageLayout
      title={driver.name}
      description="Driver risk & behavior profile"
      actions={
        <Button variant="outline" className="rounded-lg" asChild>
          <Link href="/security/behavior">Back</Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SurfaceCard className="text-center">
          <p className="text-xs text-neutral-500">Safety score</p>
          <p className="mt-1 text-3xl font-bold text-primary">{driver.safetyScore}</p>
        </SurfaceCard>
        <SurfaceCard className="text-center">
          <p className="text-xs text-neutral-500">Complaints</p>
          <p className="mt-1 text-3xl font-bold">{driver.complaints}</p>
        </SurfaceCard>
        <SurfaceCard className="text-center">
          <p className="text-xs text-neutral-500">Cancellations</p>
          <p className="mt-1 text-3xl font-bold">{driver.cancellations}</p>
        </SurfaceCard>
        <SurfaceCard className="text-center">
          <p className="text-xs text-neutral-500">Aggressive flags</p>
          <p className="mt-1 text-3xl font-bold text-red-600">{driver.aggressiveFlags}</p>
        </SurfaceCard>
      </div>
      <SurfaceCard>
        <h2 className="text-sm font-semibold text-neutral-900">Recommendations</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-600">
          {driver.safetyScore < 75 ? (
            <>
              <li>Schedule safety re-training</li>
              <li>Reduce peak-hour assignments until score improves</li>
            </>
          ) : (
            <li>Continue standard monitoring — no action required</li>
          )}
        </ul>
      </SurfaceCard>
    </DashboardPageLayout>
  );
}
