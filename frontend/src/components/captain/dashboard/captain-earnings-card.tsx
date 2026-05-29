"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, IndianRupee } from "lucide-react";

import CaptainCard from "@/components/captain/shared/captain-card";
import { captainHeading } from "@/lib/captain/captain-styles";
import {
  CaptainEarningsSummary,
  getCaptainEarnings,
} from "@/services/captain/captain-earnings.service";

export default function CaptainEarningsCard() {
  const [summary, setSummary] = useState<CaptainEarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCaptainEarnings()
      .then((data) => setSummary(data.dailySummary))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <CaptainCard>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <IndianRupee className="size-5 text-primary" />
          </div>
          <div>
            <h2 className={captainHeading}>Today&apos;s earnings</h2>
            <p className="mt-0.5 text-2xl font-semibold text-neutral-900">
              {loading
                ? "Loading..."
                : `₹${summary?.total.toLocaleString("en-IN") ?? "0"}`}
            </p>
          </div>
        </div>
        <Link
          href="/captain/earnings"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Details
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-4">
        <div>
          <dt className="text-xs text-neutral-500">Trips</dt>
          <dd className="text-sm font-semibold text-neutral-900">
            {loading ? "—" : (summary?.trips ?? 0)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Ride fares</dt>
          <dd className="text-sm font-semibold text-neutral-900">
            {loading
              ? "—"
              : `₹${summary?.tripFares.toLocaleString("en-IN") ?? "0"}`}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Net payout</dt>
          <dd className="text-sm font-semibold text-neutral-900">
            {loading
              ? "—"
              : `₹${summary?.netPayout.toLocaleString("en-IN") ?? "0"}`}
          </dd>
        </div>
      </dl>
    </CaptainCard>
  );
}
