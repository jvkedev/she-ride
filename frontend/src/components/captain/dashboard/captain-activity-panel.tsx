"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import CaptainCard from "@/components/captain/shared/captain-card";
import { captainHeading, captainMutedText } from "@/lib/captain/captain-styles";
import {
  getCaptainHistory,
  type CaptainHistoryItem,
} from "@/services/captain/captain-rides.service";

function formatWhen(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CaptainActivityPanel() {
  const [items, setItems] = useState<CaptainHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCaptainHistory(1, 5)
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CaptainCard>
      <div className="flex items-center justify-between">
        <h2 className={captainHeading}>Recent activity</h2>
        <Link
          href="/captain/ride-history"
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>
      {loading ? (
        <p className={`mt-4 ${captainMutedText}`}>Loading…</p>
      ) : items.length === 0 ? (
        <p className={`mt-4 ${captainMutedText}`}>No completed rides yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {item.rider?.user?.fullName ?? "Rider"}
                </p>
                <p className={`${captainMutedText} truncate`}>
                  {item.pickupAddress.split(",")[0]} →{" "}
                  {item.dropAddress.split(",")[0]}
                </p>
                <p className="text-xs text-neutral-400">
                  {formatWhen(item.completedAt ?? item.startedAt)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-neutral-900">
                ₹{(item.finalFare ?? item.estimatedFare).toFixed(0)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </CaptainCard>
  );
}
