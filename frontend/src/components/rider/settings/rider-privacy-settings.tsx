import RiderCard from "@/components/rider/shared/rider-card";

const privacyOptions = [
  { label: "Share live location during trips", enabled: true },
  { label: "Show profile to captains", enabled: true },
  { label: "Personalized recommendations", enabled: false },
];

export default function RiderPrivacySettings() {
  return (
    <RiderCard>
      <h2 className="text-sm font-semibold text-neutral-900">
        Privacy & data
      </h2>
      <ul className="mt-4 space-y-3">
        {privacyOptions.map((option) => (
          <li
            key={option.label}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="text-neutral-700">{option.label}</span>
            <span
              className={
                option.enabled
                  ? "text-xs font-medium text-primary"
                  : "text-xs text-neutral-400"
              }
            >
              {option.enabled ? "On" : "Off"}
            </span>
          </li>
        ))}
      </ul>
    </RiderCard>
  );
}
