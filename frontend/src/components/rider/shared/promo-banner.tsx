import { Tag } from "lucide-react";

import { cn } from "@/lib/utils";

type PromoBannerProps = {
  message?: string;
  className?: string;
};

export default function PromoBanner({
  message = "20% off your next ride. Up to ₹400 off",
  className,
}: PromoBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg bg-[#e8f5e9] px-3 py-2.5 text-sm text-[#2e7d32]",
        className,
      )}
    >
      <Tag className="size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
