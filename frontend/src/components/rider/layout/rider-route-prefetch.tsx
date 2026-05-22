import Link from "next/link";

import { riderSidebarLinks } from "@/components/rider/layout/rider-nav-links";

export default function RiderRoutePrefetch() {
  return (
    <div className="sr-only" aria-hidden>
      {riderSidebarLinks.map((link) => (
        <Link key={link.href} href={link.href} prefetch />
      ))}
    </div>
  );
}
