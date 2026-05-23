"use client";

import { useState } from "react";

import RiderCard from "@/components/rider/shared/rider-card";
import RiderSettingToggle from "@/components/rider/shared/rider-setting-toggle";

type PrivacyOption = {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
};

const initialPrivacy: PrivacyOption[] = [
  {
    id: "location",
    label: "Share live location during trips",
    description: "Helps captains navigate and improves safety",
    enabled: true,
  },
  {
    id: "profile",
    label: "Show profile to captains",
    description: "Name and rating visible on active rides",
    enabled: true,
  },
  {
    id: "reco",
    label: "Personalized recommendations",
    description: "Trip and offer suggestions based on usage",
    enabled: false,
  },
];

export default function RiderPrivacySettings() {
  const [privacy, setPrivacy] = useState(initialPrivacy);

  function toggle(id: string) {
    setPrivacy((rows) =>
      rows.map((row) =>
        row.id === id ? { ...row, enabled: !row.enabled } : row,
      ),
    );
  }

  return (
    <RiderCard>
      <h2 className="text-sm font-semibold text-neutral-900">Privacy & data</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Manage what you share during and after rides.
      </p>
      <ul className="mt-4 divide-y divide-neutral-100">
        {privacy.map((option) => (
          <li key={option.id}>
            <RiderSettingToggle
              label={option.label}
              description={option.description}
              enabled={option.enabled}
              onToggle={() => toggle(option.id)}
            />
          </li>
        ))}
      </ul>
    </RiderCard>
  );
}
