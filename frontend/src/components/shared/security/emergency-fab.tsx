"use client";

import { Phone, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmergencyFabProps = {
  className?: string;
};

export default function EmergencyFab({ className }: EmergencyFabProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col gap-2",
        className,
      )}
    >
      <Button
        size="icon-lg"
        variant="destructive"
        className="size-14 rounded-full shadow-lg"
        aria-label="Trigger emergency protocol"
      >
        <ShieldAlert className="size-6" />
      </Button>
      <Button
        size="icon"
        className="size-11 rounded-full bg-neutral-900 shadow-md dark:bg-white dark:text-neutral-900"
        aria-label="Call emergency hotline"
      >
        <Phone className="size-4" />
      </Button>
    </div>
  );
}
