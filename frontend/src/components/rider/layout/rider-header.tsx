"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Bell, Clock, Menu, User } from "lucide-react";

import { riderSidebarLinks } from "@/components/rider/layout/rider-nav-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function RiderHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-neutral-200 bg-white">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-lg text-neutral-700 lg:hidden"
              >
                <Menu className="size-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="rider-menu-sheet flex w-[min(300px,88vw)] flex-col border-neutral-200 bg-white p-0"
            >
              <SheetHeader className="border-b border-neutral-100 px-4 py-4 text-left">
                <SheetTitle className="text-lg font-bold text-neutral-900">
                  She Ride
                </SheetTitle>
              </SheetHeader>
              <nav className="rider-panel-scroll flex-1 space-y-0.5 px-2 py-4">
                {riderSidebarLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900"
                    >
                      <Icon className="size-4 shrink-0" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            href="/rider"
            className="truncate text-lg font-bold tracking-tight text-neutral-900 lg:hidden"
          >
            <Image src="/logos/logo.png" alt="logo" width={50} height={50} />
          </Link>
        </div>

        <div className="hidden rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 md:block">
          <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
            Wallet balance
          </p>
          <p className="text-lg font-semibold text-neutral-900">₹1,250</p>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100"
          >
            <Bell className="size-5" />
          </button>

          <Button
            variant="outline"
            className="hidden h-9 gap-2 rounded-lg border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-900 shadow-none hover:bg-neutral-50 sm:flex"
          >
            <Clock className="size-4" />
            Activity
          </Button>

          <Link
            href="/rider/profile"
            className={cn(
              "flex items-center gap-2 rounded-lg border border-neutral-200 px-2 py-1.5 transition hover:bg-neutral-50",
            )}
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-neutral-200">
              <User className="size-4 text-neutral-600" />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-medium text-neutral-900">
                Rider
              </p>
              <p className="text-xs text-neutral-500">Profile</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
