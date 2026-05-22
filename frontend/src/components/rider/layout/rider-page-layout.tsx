type RiderPageLayoutProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function RiderPageLayout({
  title,
  description,
  children,
}: RiderPageLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
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
