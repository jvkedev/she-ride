"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import {
  getRiderHistory,
  RideHistoryItem,
} from "@/services/rides/rides.service";

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

const VEHICLE_LABEL: Record<string, string> = {
  BIKE: "She Bike Saver",
  AUTO: "She Auto",
  CAR: "She Go",
  SUV: "She Premier",
};

export default function RideHistoryPanel() {
  const [rides, setRides] = useState<RideHistoryItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory(page = 1) {
    try {
      setLoading(true);
      const result = await getRiderHistory(page, 10);
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
      <div className="flex items-center justify-center py-12 text-neutral-400">
        <Loader2 className="size-5 animate-spin mr-2" />
        <span className="text-sm">Loading rides...</span>
      </div>
    );
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-500">{error}</p>;
  }

  if (rides.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-400">No rides yet</p>
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {rides.map((ride) => (
          <li
            key={ride.id}
            className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900">
                  {formatDate(ride.completedAt ?? ride.startedAt)}
                </p>
                <p className="mt-2 flex items-start gap-2 text-sm text-neutral-600">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  <span className="line-clamp-2">
                    {formatAddress(ride.pickupAddress)} →{" "}
                    {formatAddress(ride.dropAddress)}
                  </span>
                </p>
                <p className="mt-2 text-xs text-neutral-500">
                  {VEHICLE_LABEL[ride.vehicleType] ?? ride.vehicleType}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-neutral-900">
                  ₹{(ride.finalFare ?? ride.estimatedFare).toFixed(2)}
                </p>
                <p
                  className={`mt-1 text-xs ${
                    ride.status === "COMPLETED"
                      ? "text-[#2e7d32]"
                      : "text-red-500"
                  }`}
                >
                  {ride.status === "COMPLETED" ? "Completed" : "Cancelled"}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>

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
