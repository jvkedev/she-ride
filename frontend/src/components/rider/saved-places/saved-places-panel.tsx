import { Briefcase, Home, MapPin, Plus, Star } from "lucide-react";

import { Button } from "@/components/ui/button";

const places = [
  {
    id: "home",
    label: "Home",
    address: "Block A, Rohini Sector 14, Delhi",
    icon: Home,
  },
  {
    id: "work",
    label: "Work",
    address: "ITL Twin Tower, Netaji Subhash Place",
    icon: Briefcase,
  },
  {
    id: "school",
    label: "Century Public School",
    address: "Pitampura, Delhi",
    icon: Star,
  },
];

export default function SavedPlacesPanel() {
  return (
    <>
      <Button
        variant="outline"
        className="h-11 w-full rounded-lg border-neutral-300 border-dashed bg-white text-neutral-700 hover:bg-neutral-50"
      >
        <Plus className="size-4" />
        Add new place
      </Button>

      <ul className="space-y-3">
        {places.map((place) => {
          const Icon = place.icon;
          return (
            <li
              key={place.id}
              className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                <Icon className="size-4 text-neutral-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-900">{place.label}</p>
                <p className="mt-0.5 flex items-start gap-1.5 text-sm text-neutral-500">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" />
                  {place.address}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
