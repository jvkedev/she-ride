import { cn } from "@/lib/utils";

import { captainSurface } from "@/lib/captain/captain-styles";

type CaptainCardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
};

export default function CaptainCard({
  children,
  className,
  padding = "md",
}: CaptainCardProps) {
  return (
    <div
      className={cn(
        captainSurface,
        padding === "sm" && "p-4",
        padding === "md" && "p-5",
        padding === "none" && "p-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
