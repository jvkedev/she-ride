import RiderCard from "@/components/rider/shared/rider-card";

const preferences = [
  { label: "Trip status notifications", enabled: true },
  { label: "Promo & offer alerts", enabled: true },
  { label: "Share ride reminders", enabled: true },
  { label: "Night mode", enabled: false },
];

export default function RiderAppPreferences() {
  return (
    <RiderCard>
      <h2 className="text-sm font-semibold text-neutral-900">App preferences</h2>
      <ul className="mt-4 space-y-3">
        {preferences.map((pref) => (
          <li
            key={pref.label}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="text-neutral-700">{pref.label}</span>
            <span
              className={
                pref.enabled
                  ? "text-xs font-medium text-primary"
                  : "text-xs text-neutral-400"
              }
            >
              {pref.enabled ? "On" : "Off"}
            </span>
          </li>
        ))}
      </ul>
    </RiderCard>
  );
}
