import { CreditCard, FileQuestion, MapPin, Shield } from "lucide-react";

import CaptainCard from "@/components/captain/shared/captain-card";
import { captainHeading } from "@/lib/captain/captain-styles";

const categories = [
  { icon: MapPin, label: "Trip & navigation" },
  { icon: CreditCard, label: "Payments & wallet" },
  { icon: Shield, label: "Safety & SOS" },
  { icon: FileQuestion, label: "Account & documents" },
];

export default function HelpCategories() {
  return (
    <CaptainCard>
      <h2 className={captainHeading}>How can we help?</h2>
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
    </CaptainCard>
  );
}
