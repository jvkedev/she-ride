"use client";

import CaptainActionButton from "@/components/captain/shared/captain-action-button";

type RequestActionsProps = {
  onAccept?: () => void;
  onDecline?: () => void;
  disabled?: boolean;
};

export default function RequestActions({
  onAccept,
  onDecline,
  disabled,
}: RequestActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <CaptainActionButton
        variant="outline"
        size="default"
        className="h-10 border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50"
        onClick={onDecline}
        disabled={disabled}
      >
        Decline
      </CaptainActionButton>
      <CaptainActionButton
        size="default"
        className="h-10"
        onClick={onAccept}
        disabled={disabled}
      >
        Accept
      </CaptainActionButton>
    </div>
  );
}
