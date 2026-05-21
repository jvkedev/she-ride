"use client";

import Link from "next/link";

import { riderMenuLinks } from "@/components/rider/layout/rider-nav-links";
import { riderNavTabs } from "@/components/rider/layout/rider-nav-tabs";

/** Prefetch rider panel and tab routes once for faster navigation. */
export default function RiderRoutePrefetch() {
  const hrefs = new Set([
    ...riderMenuLinks.map((l) => l.href),
    ...riderNavTabs.map((t) => t.href),
  ]);

  return (
    <div className="hidden" aria-hidden>
      {[...hrefs].map((href) => (
        <Link key={href} href={href} prefetch />
      ))}
    </div>
  );
}
