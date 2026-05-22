import { captainPageTitle } from "@/lib/captain/captain-styles";
import { cn } from "@/lib/utils";

type CaptainPageLayoutProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
};

export default function CaptainPageLayout({
  title,
  description,
  children,
  className,
  wide = false,
}: CaptainPageLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 lg:py-8",
        wide ? "max-w-6xl" : "max-w-3xl",
        className,
      )}
    >
      <header className="mb-6">
        <h1 className={captainPageTitle}>{title}</h1>
        {description ? (
          <p className="mt-1.5 text-sm text-neutral-500">{description}</p>
        ) : null}
      </header>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
