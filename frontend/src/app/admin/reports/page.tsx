"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  blockCaptain,
  updateCaptainReportStatus,
} from "@/services/admin/admin.service";
import { apiFetch } from "@/services/api/api-client";

type CaptainReportRow = {
  id: string;
  category: string;
  status: string;
  description: string | null;
  createdAt: string;
  captainId: string;
  rider: { user: { fullName: string; phoneNumber: string } };
  captain: { user: { fullName: string; phoneNumber: string } };
  ride: {
    pickupAddress: string;
    dropAddress: string;
    status: string;
  };
};

export default function AdminCaptainReportsPage() {
  const [reports, setReports] = useState<CaptainReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiFetch("/reports/captain/admin")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then(setReports)
      .catch(() => setError("Could not load captain reports"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    setActionId(id);
    try {
      await updateCaptainReportStatus(id, { status });
      load();
    } catch {
      setError("Failed to update report.");
    } finally {
      setActionId(null);
    }
  }

  async function suspendCaptain(report: CaptainReportRow) {
    setActionId(report.id);
    try {
      await blockCaptain(report.captainId);
      await updateCaptainReportStatus(report.id, {
        status: "RESOLVED",
        adminNote: "Captain suspended after report review",
      });
      load();
    } catch {
      setError("Failed to suspend captain.");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Captain reports
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Rider-submitted reports linked to rides and captains.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-neutral-400">
          <Loader2 className="size-5 animate-spin" />
          Loading...
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && reports.length === 0 && (
        <p className="text-sm text-neutral-500">No reports yet.</p>
      )}

      <ul className="space-y-3">
        {reports.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-neutral-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-neutral-900">
                  {r.category.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-neutral-500">
                  {new Date(r.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <StatusBadge status={r.status.toLowerCase() as "open"} />
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Ride: {r.ride.pickupAddress} → {r.ride.dropAddress} (
              {r.ride.status})
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Rider: {r.rider.user.fullName} · Captain:{" "}
              {r.captain.user.fullName}
            </p>
            {r.description && (
              <p className="mt-2 text-sm text-neutral-700">{r.description}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg text-xs"
                disabled={actionId === r.id}
                onClick={() => updateStatus(r.id, "UNDER_REVIEW")}
              >
                Review
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg text-xs"
                disabled={actionId === r.id}
                onClick={() => updateStatus(r.id, "RESOLVED")}
              >
                Resolve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-lg text-xs"
                disabled={actionId === r.id}
                onClick={() => suspendCaptain(r)}
              >
                Suspend captain
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
