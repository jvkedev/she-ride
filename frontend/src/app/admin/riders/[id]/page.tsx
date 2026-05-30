"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import {
  blockRider,
  fetchRiderById,
  unblockRider,
  type AdminRiderDetail,
} from "@/services/admin/admin.service";

export default function AdminRiderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [rider, setRider] = useState<AdminRiderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRiderById(id);
      setRider(data);
    } catch {
      setError("Rider not found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleBlock() {
    if (!rider) return;
    setActionLoading(true);
    try {
      if (rider.status === "active") {
        await blockRider(rider.id);
      } else {
        await unblockRider(rider.id);
      }
      await load();
    } catch {
      setError("Action failed.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardPageLayout title="Rider details">
        <div className="flex items-center gap-2 text-neutral-500">
          <Loader2 className="size-5 animate-spin" />
          Loading…
        </div>
      </DashboardPageLayout>
    );
  }

  if (error || !rider) {
    return (
      <DashboardPageLayout title="Rider details">
        <p className="text-sm text-red-600">{error ?? "Not found"}</p>
      </DashboardPageLayout>
    );
  }

  const isActive = rider.status === "active";

  return (
    <DashboardPageLayout
      title={rider.name}
      description={`Member since ${new Date(rider.joinedAt).toLocaleDateString("en-IN")}`}
      actions={
        <>
          <Button
            variant="destructive"
            className="rounded-lg"
            disabled={actionLoading}
            onClick={toggleBlock}
          >
            {actionLoading ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : isActive ? (
              "Block rider"
            ) : (
              "Unblock rider"
            )}
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
            <div>
              <dt className="text-neutral-500">Rating</dt>
              <dd className="font-medium">{rider.rating.toFixed(2)}</dd>
            </div>
          </dl>
        </SurfaceCard>

        <SurfaceCard>
          <h2 className="text-sm font-semibold text-neutral-900">Recent rides</h2>
          <ul className="mt-4 space-y-3">
            {rider.recentRides.length === 0 ? (
              <li className="text-sm text-neutral-500">No rides yet.</li>
            ) : (
              rider.recentRides.map((ride) => (
                <li
                  key={ride.id}
                  className="rounded-lg border border-neutral-100 px-3 py-2.5 text-sm"
                >
                  <div className="flex justify-between gap-2">
                    <span className="truncate">{ride.pickup}</span>
                    <span className="font-medium shrink-0">₹{ride.fare}</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {ride.driverName} · {ride.status}
                  </p>
                </li>
              ))
            )}
          </ul>
        </SurfaceCard>

        <SurfaceCard>
          <h2 className="text-sm font-semibold text-neutral-900">Payments</h2>
          <ul className="mt-4 space-y-3">
            {rider.payments.length === 0 ? (
              <li className="text-sm text-neutral-500">No payments yet.</li>
            ) : (
              rider.payments.slice(0, 5).map((payment) => (
                <li
                  key={payment.id}
                  className="flex justify-between rounded-lg border border-neutral-100 px-3 py-2.5 text-sm"
                >
                  <span className="capitalize">{payment.method}</span>
                  <span className="font-medium">₹{payment.amount}</span>
                </li>
              ))
            )}
          </ul>
        </SurfaceCard>

        <SurfaceCard>
          <h2 className="text-sm font-semibold text-neutral-900">Captain reports</h2>
          <ul className="mt-4 space-y-3">
            {rider.reports.length === 0 ? (
              <li className="text-sm text-neutral-500">No reports filed.</li>
            ) : (
              rider.reports.map((report) => (
                <li
                  key={report.id}
                  className="rounded-lg border border-neutral-100 px-3 py-2.5 text-sm"
                >
                  <div className="flex justify-between gap-2">
                    <span>{report.category.replace(/_/g, " ")}</span>
                    <StatusBadge status={report.status.toLowerCase() as "open"} />
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    vs {report.captainName}
                  </p>
                </li>
              ))
            )}
          </ul>
        </SurfaceCard>
      </div>
    </DashboardPageLayout>
  );
}
