"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const MAP_LAYOUT_ROUTES = ["/rider", "/rider/rentals", "/rider/parcel"];

export default function RiderMain({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMapLayout = MAP_LAYOUT_ROUTES.includes(pathname);

  return (
    <main
      className={cn(
        "w-full",
        isMapLayout ? "overflow-hidden" : "min-h-[calc(100dvh-4rem)]",
      )}
    >
      {children}
    </main>
  );
}
