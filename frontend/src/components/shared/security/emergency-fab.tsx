"use client";

import Link from "next/link";
import { Siren } from "lucide-react";

import { cn } from "@/lib/utils";

type EmergencyFabProps = {
  className?: string;
};

export default function EmergencyFab({ className }: EmergencyFabProps) {
  return (
    <Link
      href="/security/emergency"
      className={cn(
        "fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary/90",
        className,
      )}
      aria-label="Emergency response"
    >
      <Siren className="size-6" />
    </Link>
  );
}
