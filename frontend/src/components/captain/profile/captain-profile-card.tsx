import CaptainCard from "@/components/captain/shared/captain-card";
import { captainProfile } from "@/lib/captain/captain-mock-data";

export default function CaptainProfileCard() {
  return (
    <CaptainCard className="text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-neutral-200 text-2xl font-bold text-neutral-700">
        {captainProfile.name.charAt(0)}
      </div>
      <h2 className="mt-4 text-xl font-semibold text-neutral-900">
        {captainProfile.name}
      </h2>
      <p className="mt-1 text-sm text-neutral-500">She Ride Captain</p>
      <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-6">
        <div>
          <dt className="text-xs text-neutral-500">Rating</dt>
          <dd className="font-semibold text-neutral-900">
            {captainProfile.rating}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Trips</dt>
          <dd className="font-semibold text-neutral-900">
            {captainProfile.totalTrips}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Vehicle</dt>
          <dd className="text-sm font-semibold text-neutral-900">
            {captainProfile.vehicle}
          </dd>
        </div>
      </dl>
    </CaptainCard>
  );
}
