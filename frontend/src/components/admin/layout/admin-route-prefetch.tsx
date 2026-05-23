import Link from "next/link";

import { adminNavLinks } from "@/lib/admin/nav-links";

export default function AdminRoutePrefetch() {
  return (
    <div className="sr-only" aria-hidden>
      {adminNavLinks.map((link) => (
        <Link key={link.href} href={link.href} prefetch />
      ))}
    </div>
  );
}
