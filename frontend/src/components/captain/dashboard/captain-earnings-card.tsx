import Link from "next/link";
import { ArrowRight, IndianRupee } from "lucide-react";

import CaptainCard from "@/components/captain/shared/captain-card";
import { todayEarningsSummary } from "@/lib/captain/captain-mock-data";
import { captainHeading } from "@/lib/captain/captain-styles";

export default function CaptainEarningsCard() {
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
              ₹{todayEarningsSummary.total.toLocaleString("en-IN")}
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
            {todayEarningsSummary.trips}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Incentives</dt>
          <dd className="text-sm font-semibold text-emerald-600">
            +₹{todayEarningsSummary.incentives}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Net payout</dt>
          <dd className="text-sm font-semibold text-neutral-900">
            ₹{todayEarningsSummary.netPayout.toLocaleString("en-IN")}
          </dd>
        </div>
      </dl>
    </CaptainCard>
  );
}
