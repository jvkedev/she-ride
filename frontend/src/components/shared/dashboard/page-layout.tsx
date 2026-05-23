import {
  dashboardPageShell,
  dashboardPageTitle,
} from "@/lib/dashboard/styles";
import { cn } from "@/lib/utils";

type DashboardPageLayoutProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
  actions?: React.ReactNode;
};

export default function DashboardPageLayout({
  title,
  description,
  children,
  className,
  wide = false,
  actions,
}: DashboardPageLayoutProps) {
  return (
    <div
      className={cn(
        dashboardPageShell,
        wide ? "max-w-7xl" : "max-w-6xl",
        className,
      )}
    >
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className={dashboardPageTitle}>{title}</h1>
          {description ? (
            <p className="mt-1.5 text-sm text-neutral-500">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </header>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
