"use client";

import { useState } from "react";

import RiderCard from "@/components/rider/shared/rider-card";
import RiderSettingToggle from "@/components/rider/shared/rider-setting-toggle";

type Preference = {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
};

const initialPreferences: Preference[] = [
  {
    id: "trip",
    label: "Trip status notifications",
    description: "Pickup, arrival, and trip complete alerts",
    enabled: true,
  },
  {
    id: "promo",
    label: "Promo & offer alerts",
    description: "Discounts and She Ride promotions",
    enabled: true,
  },
  {
    id: "share",
    label: "Share ride reminders",
    description: "Prompt to share live trip with contacts",
    enabled: true,
  },
  {
    id: "night",
    label: "Night mode",
    description: "Darker theme for low-light use",
    enabled: false,
  },
];

export default function RiderAppPreferences() {
  const [preferences, setPreferences] = useState(initialPreferences);

  function toggle(id: string) {
    setPreferences((rows) =>
      rows.map((row) =>
        row.id === id ? { ...row, enabled: !row.enabled } : row,
      ),
    );
  }

  return (
    <RiderCard>
      <h2 className="text-sm font-semibold text-neutral-900">App preferences</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Control notifications and how the app behaves.
      </p>
      <ul className="mt-4 divide-y divide-neutral-100">
        {preferences.map((pref) => (
          <li key={pref.id}>
            <RiderSettingToggle
              label={pref.label}
              description={pref.description}
              enabled={pref.enabled}
              onToggle={() => toggle(pref.id)}
            />
          </li>
        ))}
      </ul>
    </RiderCard>
  );
}
