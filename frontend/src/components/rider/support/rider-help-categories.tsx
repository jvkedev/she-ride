import { CreditCard, FileQuestion, Key, MapPin, Shield } from "lucide-react";

import RiderCard from "@/components/rider/shared/rider-card";

const categories = [
  { icon: MapPin, label: "Booking & trips" },
  { icon: CreditCard, label: "Payments & wallet" },
  { icon: Key, label: "Rentals & parcel" },
  { icon: Shield, label: "Safety & SOS" },
  { icon: FileQuestion, label: "Account & profile" },
];

export default function RiderHelpCategories() {
  return (
    <RiderCard>
      <h2 className="text-sm font-semibold text-neutral-900">How can we help?</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <li key={cat.label}>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border border-neutral-100 px-3 py-3 text-left text-sm font-medium text-neutral-800 transition hover:border-neutral-200 hover:bg-neutral-50"
              >
                <Icon className="size-4 text-neutral-600" />
                {cat.label}
              </button>
            </li>
          );
        })}
      </ul>
    </RiderCard>
  );
}
