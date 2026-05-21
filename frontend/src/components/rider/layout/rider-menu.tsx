"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";

import { riderMenuLinks } from "@/components/rider/layout/rider-nav-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type RiderMenuProps = {
  className?: string;
};

export default function RiderMenu({ className }: RiderMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "rounded-lg text-neutral-700 hover:bg-primary/10 hover:text-primary",
            className,
          )}
        >
          <Menu className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className={cn(
          "rider-menu-sheet flex w-[min(320px,88vw)] flex-col border-border bg-white sm:max-w-[320px]",
          "duration-200 ease-out data-closed:duration-200",
        )}
      >
        <SheetHeader className="border-b border-border/60 pb-4">
          <SheetTitle className="text-left text-lg font-semibold text-primary">
            Menu
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-1.5 pt-4">
          {riderMenuLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-neutral-700 hover:bg-primary/10 hover:text-primary",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <p className="mt-auto border-t border-border/60 pt-4 text-xs text-muted-foreground">
          She Ride — Safe rides for women
        </p>
      </SheetContent>
    </Sheet>
  );
}
