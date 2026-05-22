"use client";

import { useEffect, useState } from "react";

type RequestTimerProps = {
  seconds?: number;
  onExpire?: () => void;
};

export default function RequestTimer({
  seconds = 30,
  onExpire,
}: RequestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const id = window.setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [remaining, onExpire]);

  const progress = (remaining / seconds) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-neutral-600">Expires in</span>
        <span className="font-semibold text-neutral-900">{remaining}s</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
