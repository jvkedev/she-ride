import { cn } from "@/lib/utils";

type RiderPageLayoutProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
};

export default function RiderPageLayout({
  title,
  description,
  children,
  wide = false,
  className,
}: RiderPageLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 lg:py-8",
        wide ? "max-w-5xl" : "max-w-3xl",
        className,
      )}
    >
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm text-neutral-500">{description}</p>
        ) : null}
      </header>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
