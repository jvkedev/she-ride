import RiderCard from "@/components/rider/shared/rider-card";
import { riderProfile } from "@/lib/rider/rider-mock-data";

export default function RiderProfileCard() {
  return (
    <RiderCard className="text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-neutral-200 text-2xl font-bold text-neutral-700">
        {riderProfile.name.charAt(0)}
      </div>
      <h2 className="mt-4 text-xl font-semibold text-neutral-900">
        {riderProfile.name}
      </h2>
      <p className="mt-1 text-sm text-neutral-500">She Ride Rider</p>
      <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-6">
        <div>
          <dt className="text-xs text-neutral-500">Rating</dt>
          <dd className="font-semibold text-neutral-900">
            {riderProfile.rating}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Rides</dt>
          <dd className="font-semibold text-neutral-900">
            {riderProfile.totalRides}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">Member</dt>
          <dd className="text-sm font-semibold text-neutral-900">
            {riderProfile.memberSince}
          </dd>
        </div>
      </dl>
    </RiderCard>
  );
}
