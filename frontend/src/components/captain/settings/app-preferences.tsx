import CaptainCard from "@/components/captain/shared/captain-card";
import { captainHeading } from "@/lib/captain/captain-styles";

const preferences = [
  { label: "Sound alerts for new requests", enabled: true },
  { label: "Vibration on incoming ride", enabled: true },
  { label: "Auto-accept nearby rides", enabled: false },
  { label: "Night mode", enabled: false },
];

export default function AppPreferences() {
  return (
    <CaptainCard>
      <h2 className={captainHeading}>App preferences</h2>
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
    </CaptainCard>
  );
}
