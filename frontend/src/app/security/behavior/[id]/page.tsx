"use client";
import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { useCaptainBehaviorSummary } from "@/hooks/security/use-driver-behavior";

type PageProps = { params: Promise<{ id: string }> };

export default function DriverBehaviorProfilePage({ params }: PageProps) {
  const { id } = use(params);
  const { data: summary, isLoading, isError } = useCaptainBehaviorSummary(id);

  if (isLoading) {
    return (
      <DashboardPageLayout
        title="Loading..."
        description="Driver risk & behavior profile"
      >
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-neutral-100"
            />
          ))}
        </div>
      </DashboardPageLayout>
    );
  }

  if (isError || !summary) {
    notFound();
  }

  return (
    <DashboardPageLayout
      title={summary.name}
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
          <p className="mt-1 text-3xl font-bold text-primary">
            {summary.safetyScore}
          </p>
        </SurfaceCard>
        <SurfaceCard className="text-center">
          <p className="text-xs text-neutral-500">Total flags</p>
          <p className="mt-1 text-3xl font-bold">{summary.total}</p>
        </SurfaceCard>
        <SurfaceCard className="text-center">
          <p className="text-xs text-neutral-500">Unreviewed</p>
          <p className="mt-1 text-3xl font-bold">{summary.unreviewed}</p>
        </SurfaceCard>
        <SurfaceCard className="text-center">
          <p className="text-xs text-neutral-500">High severity</p>
          <p className="mt-1 text-3xl font-bold text-red-600">
            {summary.highSeverity}
          </p>
        </SurfaceCard>
      </div>

      {summary.byType?.length > 0 && (
        <SurfaceCard>
          <h2 className="text-sm font-semibold text-neutral-900">
            Flags by type
          </h2>
          <ul className="mt-3 space-y-2">
            {summary.byType.map((t: any) => (
              <li
                key={t.flagType}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-neutral-600">{t.flagType}</span>
                <span className="font-medium">{t._count.flagType}</span>
              </li>
            ))}
          </ul>
        </SurfaceCard>
      )}

      <SurfaceCard>
        <h2 className="text-sm font-semibold text-neutral-900">
          Recommendations
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-600">
          {summary.safetyScore < 75 ? (
            <>
              <li>Schedule safety re-training</li>
              <li>Reduce peak-hour assignments until score improves</li>
              {summary.highSeverity > 3 && (
                <li>Consider temporary suspension pending review</li>
              )}
            </>
          ) : (
            <li>Continue standard monitoring — no action required</li>
          )}
        </ul>
      </SurfaceCard>
    </DashboardPageLayout>
  );
}
