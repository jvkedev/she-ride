import Link from "next/link";

import { captainNavLinks } from "@/components/captain/layout/captain-nav-links";

export default function CaptainRoutePrefetch() {
  return (
    <div className="sr-only" aria-hidden>
      {captainNavLinks.map((link) => (
        <Link key={link.href} href={link.href} prefetch />
      ))}
    </div>
  );
}
