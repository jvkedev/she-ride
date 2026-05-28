"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import DriverKycPanel from "@/components/admin/drivers/driver-kyc-panel";
import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import {
  fetchDriverById,
  updateDriverKyc,
} from "@/services/admin/admin.service";
import type { AdminDriverDetail } from "@/lib/admin/types";

function LoadingState() {
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-6 text-center text-sm text-neutral-500">
      Loading driver details...
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
        <RefreshCw className="size-3.5" />
        Retry
      </Button>
    </div>
  );
}

export default function SecurityDriverDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [driver, setDriver] = useState<AdminDriverDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDriver = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchDriverById(id);
      setDriver(data);
    } catch (loadError) {
      console.error("Failed to load driver details:", loadError);
      setError("Driver not found or failed to load.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleReview = useCallback(
    async (payload: {
      status: "APPROVED" | "REJECTED";
      documentKey: AdminDriverDetail["documents"][number]["key"];
      rejectionReason?: string;
    }) => {
      if (!id) return;

      setActionLoading(true);
      setError(null);

      try {
        const updated = await updateDriverKyc(id, payload);
        setDriver(updated);
      } catch (reviewError) {
        console.error("Failed to update driver KYC:", reviewError);
        setError("Unable to update KYC status. Please try again.");
      } finally {
        setActionLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDriver();
  }, [loadDriver]);

  const profileStatus =
    driver && (driver.status === "offline" || driver.status === "inactive")
      ? "inactive"
      : "active";

  if (loading) {
    return (
      <DashboardPageLayout
        title="Driver details"
        description="Loading profile..."
        wide
      >
        <LoadingState />
      </DashboardPageLayout>
    );
  }

  if (error || !driver) {
    return (
      <DashboardPageLayout
        title="Driver details"
        description="Unable to load this driver."
        actions={
          <Button variant="outline" className="rounded-lg" asChild>
            <Link href="/security/verification/drivers">Back to drivers</Link>
          </Button>
        }
        wide
      >
        <ErrorState message={error ?? "Driver not found."} onRetry={loadDriver} />
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout
      title={driver.name}
      description={`Captain since ${new Date(driver.joinedAt).toLocaleDateString(
        "en-IN",
      )}`}
      actions={
        <Button variant="outline" className="rounded-lg" asChild>
          <Link href="/security/verification/drivers">Back to drivers</Link>
        </Button>
      }
      wide
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-neutral-900">Profile</h2>
            <StatusBadge status={profileStatus} />
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
              <dd className="font-medium">{driver.rating > 0 ? driver.rating : "—"}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Email</dt>
              <dd className="font-medium">{driver.email ?? "—"}</dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-neutral-100 pt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-neutral-900">
                Submitted documents
              </h3>
              <StatusBadge status={driver.documentStatus} />
            </div>

            <div className="mt-4 space-y-3">
              {driver.documents.map((document) => (
                <div
                  key={document.key}
                  className="rounded-xl border border-neutral-100 bg-neutral-50/60 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {document.label}
                      </p>
                      <p className="mt-1 font-mono text-xs text-neutral-500">
                        {document.number ?? "—"}
                      </p>
                    </div>
                    <StatusBadge status={document.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SurfaceCard>

        <DriverKycPanel
          key={driver.id}
          driver={driver}
          onReview={handleReview}
          loading={actionLoading}
        />
      </div>
    </DashboardPageLayout>
  );
}
