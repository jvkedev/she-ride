"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";

import LiveIndicator from "@/components/shared/security/live-indicator";
import { securityNavLinks } from "@/lib/security/nav-links";
import { securityOverviewStats } from "@/lib/security/mock-data";
import { useSecurityWebSocket } from "@/hooks/security/use-security-websocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function SecurityHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { connected } = useSecurityWebSocket();

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-neutral-200 bg-white">
      <div className="flex h-14 items-center gap-3 px-4 sm:h-16 sm:px-6">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="lg:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="security-menu-sheet w-[min(280px,88vw)] p-0">
            <SheetHeader className="border-b px-4 py-4 text-left">
              <SheetTitle>Security Console</SheetTitle>
            </SheetHeader>
            <nav className="dashboard-panel-scroll space-y-0.5 px-2 py-4">
              {securityNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="relative hidden min-w-0 flex-1 md:block md:max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search alerts, incidents, users..."
            className="h-9 rounded-lg border-neutral-200 bg-[#eeeeee] pl-9"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <LiveIndicator connected={connected} className="hidden sm:inline-flex" />
          <div className="hidden rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 sm:block">
            <p className="text-[10px] font-medium text-red-800">Active SOS</p>
            <p className="text-sm font-semibold text-red-900">
              {securityOverviewStats.activeSos}
            </p>
          </div>
          <div className="hidden rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 md:block">
            <p className="text-[10px] font-medium text-neutral-500">Open incidents</p>
            <p className="text-sm font-semibold text-neutral-900">
              {securityOverviewStats.openIncidents}
            </p>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
          >
            <Bell className="size-5" />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
          </button>
        </div>
      </div>
    </header>
  );
}
