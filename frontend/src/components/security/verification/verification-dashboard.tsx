"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { fetchDrivers } from "@/services/admin/admin.service";
import type { AdminDriver } from "@/lib/admin/types";

function VerificationSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[...Array(4)].map((_, index) => (
        <SurfaceCard key={index}>
          <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[...Array(4)].map((__, itemIndex) => (
              <div
                key={itemIndex}
                className="space-y-2 rounded-lg border border-neutral-100 p-3"
              >
                <div className="h-3 w-20 animate-pulse rounded bg-neutral-200" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-neutral-100" />
              </div>
            ))}
          </div>
        </SurfaceCard>
      ))}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-100 bg-red-50 py-12">
      <AlertTriangle className="size-5 text-red-400" />
      <p className="text-sm text-red-600">{message}</p>
      <Button
        size="sm"
        variant="outline"
        onClick={onRetry}
        className="gap-1.5 text-xs"
      >
        <RefreshCw className="size-3.5" /> Retry
      </Button>
    </div>
  );
}

export default function VerificationDashboard() {
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchDrivers();
      setDrivers(data);
    } catch (loadError) {
      console.error("Failed to load driver verification data:", loadError);
      setError("Failed to load drivers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const queueDrivers = useMemo(
    () =>
      drivers.filter(
        (driver) =>
          driver.kycStatus === "pending" || driver.kycStatus === "rejected",
      ),
    [drivers],
  );

  const sortedDrivers = useMemo(
    () =>
      [...queueDrivers].sort((left, right) => {
        const priority = { pending: 0, rejected: 1, approved: 2 } as const;
        return priority[left.kycStatus] - priority[right.kycStatus];
      }),
    [queueDrivers],
  );

  const counts = useMemo(
    () => ({
      approved: drivers.filter((driver) => driver.kycStatus === "approved")
        .length,
      pending: drivers.filter((driver) => driver.kycStatus === "pending")
        .length,
      rejected: drivers.filter((driver) => driver.kycStatus === "rejected")
        .length,
    }),
    [drivers],
  );

  if (loading) {
    return <VerificationSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDrivers} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <SurfaceCard padding="sm">
          <p className="text-xs font-medium text-neutral-500">Approved</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            {counts.approved}
          </p>
        </SurfaceCard>
        <SurfaceCard padding="sm">
          <p className="text-xs font-medium text-neutral-500">Pending review</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            {counts.pending}
          </p>
        </SurfaceCard>
        <SurfaceCard padding="sm">
          <p className="text-xs font-medium text-neutral-500">Rejected</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">
            {counts.rejected}
          </p>
        </SurfaceCard>
      </div>

      {sortedDrivers.length === 0 ? (
        <SurfaceCard>
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <CheckCircle2 className="size-8 text-emerald-500" />
            <p className="text-sm font-medium text-neutral-900">
              Verification queue is clear
            </p>
            <p className="text-xs text-neutral-500">
              No captains are waiting for document review right now.
            </p>
          </div>
        </SurfaceCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sortedDrivers.map((driver) => (
            <SurfaceCard key={driver.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-neutral-900">
                    {driver.name}
                  </h3>
                  <p className="text-xs text-neutral-500">{driver.phone}</p>
                </div>
                <StatusBadge status={driver.kycStatus} />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-neutral-100 px-3 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-neutral-700">
                      Vehicle
                    </span>
                    <Clock className="size-4 text-amber-600" />
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {driver.vehicle} · {driver.plate}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-100 px-3 py-3">
                  <div className="text-sm font-medium text-neutral-700">
                    Verification status
                  </div>
                  <StatusBadge status={driver.kycStatus} className="mt-2" />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button className="h-9 flex-1 rounded-lg" asChild>
                  <Link href={`/security/verification/drivers/${driver.id}`}>
                    Review documents
                  </Link>
                </Button>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </div>
  );
}
