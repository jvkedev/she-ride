import { Mail, Phone } from "lucide-react";

import RiderCard from "@/components/rider/shared/rider-card";
import { riderProfile } from "@/lib/rider/rider-mock-data";

export default function RiderProfileDetails() {
  return (
    <RiderCard>
      <h2 className="text-sm font-semibold text-neutral-900">
        Contact information
      </h2>
      <ul className="mt-4 space-y-3">
        <li className="flex items-center gap-3 rounded-lg border border-neutral-100 px-3 py-3">
          <Mail className="size-4 shrink-0 text-neutral-500" />
          <div className="min-w-0">
            <p className="text-xs text-neutral-500">Email</p>
            <p className="truncate text-sm font-medium text-neutral-900">
              {riderProfile.email}
            </p>
          </div>
        </li>
        <li className="flex items-center gap-3 rounded-lg border border-neutral-100 px-3 py-3">
          <Phone className="size-4 shrink-0 text-neutral-500" />
          <div className="min-w-0">
            <p className="text-xs text-neutral-500">Phone</p>
            <p className="text-sm font-medium text-neutral-900">
              {riderProfile.phone}
            </p>
          </div>
        </li>
      </ul>
    </RiderCard>
  );
}
