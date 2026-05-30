import { dashboardSurface } from "@/lib/dashboard/styles";
import { cn } from "@/lib/utils";

type SecurityCardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
};

export default function SecurityCard({
  children,
  className,
  padding = "md",
}: SecurityCardProps) {
  return (
    <div
      className={cn(
        dashboardSurface,
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
