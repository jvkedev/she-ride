import { cn } from "@/lib/utils";

const riderSurface =
  "rounded-xl border border-neutral-200 bg-white shadow-sm";

type RiderCardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
};

export default function RiderCard({
  children,
  className,
  padding = "md",
}: RiderCardProps) {
  return (
    <div
      className={cn(
        riderSurface,
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
