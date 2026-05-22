import { Car } from "lucide-react";

import CaptainCard from "@/components/captain/shared/captain-card";
import { captainProfile } from "@/lib/captain/captain-mock-data";
import { captainHeading } from "@/lib/captain/captain-styles";

export default function VehicleDetailsCard() {
  return (
    <CaptainCard>
      <div className="flex items-start gap-4">
        <div className="flex size-14 items-center justify-center rounded-xl bg-neutral-100">
          <Car className="size-7 text-neutral-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className={captainHeading}>{captainProfile.vehicle}</h2>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Active
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            {captainProfile.plateNumber}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-neutral-500">Color</dt>
              <dd className="font-medium text-neutral-900">Yellow & green</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Fuel</dt>
              <dd className="font-medium text-neutral-900">CNG</dd>
            </div>
          </dl>
        </div>
      </div>
    </CaptainCard>
  );
}
