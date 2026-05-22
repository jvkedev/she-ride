"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { captainMobileNavLinks } from "@/components/captain/layout/captain-nav-links";
import { cn } from "@/lib/utils";

export default function CaptainMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="grid grid-cols-4">
        {captainMobileNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== "/captain" && pathname.startsWith(link.href));

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition",
                  isActive ? "text-primary" : "text-neutral-500",
                )}
              >
                <Icon className="size-5" />
                <span className="truncate px-1">{link.label.split(" ")[0]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
