"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import CaptainRideHistoryCard from "@/components/captain/history/captain-ride-history-card";
import {
  getCaptainHistory,
  CaptainHistoryItem,
} from "@/services/captain/captain-rides.service";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (date.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === yesterday.toDateString())
    return `Yesterday, ${time}`;
  return (
    date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
    `, ${time}`
  );
}

function formatAddress(address: string) {
  return address.split(",")[0].trim();
}

export default function CaptainRideHistoryList() {
  const [rides, setRides] = useState<CaptainHistoryItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory(page = 1) {
    try {
      setLoading(true);
      const result = await getCaptainHistory(page, 10);
      setRides(result.data);
      setMeta({ page: result.meta.page, totalPages: result.meta.totalPages });
    } catch {
      setError("Failed to load ride history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory(1);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-neutral-400">
        <Loader2 className="size-4 animate-spin mr-2" />
        <span className="text-sm">Loading history...</span>
      </div>
    );
  }

  if (error) {
    return <p className="py-6 text-center text-sm text-red-500">{error}</p>;
  }

  if (rides.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-neutral-400">No rides yet</p>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {rides.map((ride) => (
          <CaptainRideHistoryCard
            key={ride.id}
            passenger={ride.rider?.user.fullName ?? "Unknown"}
            route={`${formatAddress(ride.pickupAddress)} → ${formatAddress(ride.dropAddress)}`}
            fare={ride.finalFare ?? ride.estimatedFare}
            date={formatDate(ride.completedAt ?? ride.startedAt)}
            status={ride.status === "COMPLETED" ? "completed" : "cancelled"}
          />
        ))}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button
            onClick={() => loadHistory(meta.page - 1)}
            disabled={meta.page === 1}
            className="px-4 py-1.5 rounded-lg border text-sm text-neutral-600 disabled:opacity-40 hover:bg-neutral-50"
          >
            Previous
          </button>
          <span className="text-sm text-neutral-400">
            {meta.page} / {meta.totalPages}
          </span>
          <button
            onClick={() => loadHistory(meta.page + 1)}
            disabled={meta.page === meta.totalPages}
            className="px-4 py-1.5 rounded-lg border text-sm text-neutral-600 disabled:opacity-40 hover:bg-neutral-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
