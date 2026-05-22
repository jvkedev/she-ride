"use client";

import { cn } from "@/lib/utils";

type CaptainOnlineToggleProps = {
  isOnline: boolean;
  onToggle: (online: boolean) => void;
  disabled?: boolean;
};

export default function CaptainOnlineToggle({
  isOnline,
  onToggle,
  disabled,
}: CaptainOnlineToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOnline}
      disabled={disabled}
      onClick={() => onToggle(!isOnline)}
      className={cn(
        "relative inline-flex h-8 w-[3.25rem] shrink-0 items-center rounded-full border transition",
        isOnline
          ? "border-primary bg-primary"
          : "border-neutral-300 bg-neutral-200",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block size-6 rounded-full bg-white shadow-sm transition-transform",
          isOnline ? "translate-x-[1.35rem]" : "translate-x-1",
        )}
      />
      <span className="sr-only">{isOnline ? "Go offline" : "Go online"}</span>
    </button>
  );
}
