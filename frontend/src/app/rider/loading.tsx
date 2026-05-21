export default function RiderLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-pulse px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-40 rounded-lg bg-neutral-200" />
        <div className="h-4 w-64 rounded bg-neutral-200" />
      </div>
      <div className="space-y-4">
        <div className="h-28 rounded-xl bg-neutral-200" />
        <div className="h-28 rounded-xl bg-neutral-200" />
        <div className="h-20 rounded-xl bg-neutral-200" />
      </div>
    </div>
  );
}
