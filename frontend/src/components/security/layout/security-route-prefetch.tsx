import Link from "next/link";

import { securityNavLinks } from "@/lib/security/nav-links";

export default function SecurityRoutePrefetch() {
  return (
    <div className="sr-only" aria-hidden>
      {securityNavLinks.map((link) => (
        <Link key={link.href} href={link.href} prefetch />
      ))}
    </div>
  );
}
