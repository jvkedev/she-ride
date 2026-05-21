"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Clock, Share2, User } from "lucide-react";

import RiderMenu from "@/components/rider/layout/rider-menu";
import { riderNavTabs } from "@/components/rider/layout/rider-nav-tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RiderHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
        <Link
          href="/rider"
          className="flex shrink-0 items-center text-xl font-bold tracking-tight text-neutral-900"
        >
          She Ride
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {riderNavTabs.map((tab) => {
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={cn(
                  "flex h-16 items-center border-b-2 px-1 text-sm font-medium transition",
                  isActive
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-900 hover:border-neutral-300",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            aria-label="Share trip"
            className="hidden rounded-lg p-2 text-neutral-700 transition hover:bg-neutral-100 sm:block"
          >
            <Share2 className="size-5" />
          </button>

          <Button
            variant="outline"
            className="hidden h-9 gap-2 rounded-lg border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 shadow-none hover:bg-neutral-50 sm:flex"
          >
            <Clock className="size-4" />
            Activity
          </Button>

          <button
            type="button"
            className="hidden items-center gap-1 rounded-lg p-1 transition hover:bg-neutral-100 sm:flex"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-neutral-200">
              <User className="size-4 text-neutral-600" />
            </div>
            <ChevronDown className="size-4 text-neutral-600" />
          </button>

          <RiderMenu />
        </div>
      </div>
    </header>
  );
}
