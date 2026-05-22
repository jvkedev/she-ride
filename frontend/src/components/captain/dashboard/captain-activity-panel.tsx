import Link from "next/link";

import CaptainCard from "@/components/captain/shared/captain-card";
import { rideHistoryItems } from "@/lib/captain/captain-mock-data";
import { captainHeading, captainMutedText } from "@/lib/captain/captain-styles";

export default function CaptainActivityPanel() {
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
      <ul className="mt-4 space-y-3">
        {rideHistoryItems.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">
                {item.passenger}
              </p>
              <p className={`${captainMutedText} truncate`}>{item.route}</p>
              <p className="text-xs text-neutral-400">{item.date}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-neutral-900">
              ₹{item.fare}
            </p>
          </li>
        ))}
      </ul>
    </CaptainCard>
  );
}
