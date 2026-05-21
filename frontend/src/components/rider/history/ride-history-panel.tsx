import { MapPin } from "lucide-react";

const rides = [
  {
    id: "1",
    date: "Today, 2:30 PM",
    route: "ITL Twin Tower → Century Public School",
    vehicle: "She Go",
    fare: "₹501.95",
    status: "Completed",
  },
  {
    id: "2",
    date: "Yesterday, 6:15 PM",
    route: "Connaught Place → Saket",
    vehicle: "She Premier",
    fare: "₹206.11",
    status: "Completed",
  },
  {
    id: "3",
    date: "12 May, 9:00 AM",
    route: "Home → Office",
    vehicle: "She Bike Saver",
    fare: "₹245.89",
    status: "Completed",
  },
];

export default function RideHistoryPanel() {
  return (
    <ul className="space-y-3">
      {rides.map((ride) => (
        <li
          key={ride.id}
          className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900">{ride.date}</p>
              <p className="mt-2 flex items-start gap-2 text-sm text-neutral-600">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                <span className="line-clamp-2">{ride.route}</span>
              </p>
              <p className="mt-2 text-xs text-neutral-500">{ride.vehicle}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-neutral-900">{ride.fare}</p>
              <p className="mt-1 text-xs text-[#2e7d32]">{ride.status}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
