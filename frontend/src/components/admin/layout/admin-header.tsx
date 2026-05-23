"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";

import { adminNavLinks } from "@/lib/admin/nav-links";
import { adminOverviewStats } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AdminHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <SheetContent side="left" className="admin-menu-sheet w-[min(280px,88vw)] p-0">
            <SheetHeader className="border-b px-4 py-4 text-left">
              <SheetTitle>Admin Console</SheetTitle>
            </SheetHeader>
            <nav className="dashboard-panel-scroll space-y-0.5 px-2 py-4">
              {adminNavLinks.map((link) => {
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
            placeholder="Search drivers, riders, rides..."
            className="h-9 rounded-lg border-neutral-200 bg-[#eeeeee] pl-9"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 sm:block">
            <p className="text-[10px] font-medium text-amber-800">Pending approvals</p>
            <p className="text-sm font-semibold text-amber-900">
              {adminOverviewStats.pendingApprovals}
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
