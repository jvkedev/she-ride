"use client";

import { cn } from "@/lib/utils";

type RiderSettingToggleProps = {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
};

export default function RiderSettingToggle({
  label,
  description,
  enabled,
  onToggle,
}: RiderSettingToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 rounded-lg px-1 py-2.5 text-left transition hover:bg-neutral-50"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-neutral-900">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-neutral-500">{description}</span>
        ) : null}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          enabled ? "bg-primary" : "bg-neutral-200",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            enabled ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
