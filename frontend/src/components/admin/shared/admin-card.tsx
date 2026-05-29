import { dashboardSurface } from "@/lib/dashboard/styles";
import { cn } from "@/lib/utils";

type AdminCardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
};

export default function AdminCard({
  children,
  className,
  padding = "md",
}: AdminCardProps) {
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
