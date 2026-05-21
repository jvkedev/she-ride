export default function BookingLoading() {
  return (
    <div className="grid h-[calc(100dvh-4rem)] animate-pulse bg-[#f6f6f6] lg:grid-cols-[380px_1fr]">
      <div className="border-neutral-200 bg-white p-6 lg:border-r">
        <div className="h-8 w-36 rounded-lg bg-neutral-200" />
        <div className="mt-5 h-10 rounded-lg bg-neutral-200" />
        <div className="mt-2 h-12 rounded-lg bg-neutral-200" />
        <div className="mt-2 h-12 rounded-lg bg-neutral-200" />
        <div className="mt-3 h-12 rounded-lg bg-neutral-200" />
        <div className="mt-auto h-12 rounded-lg bg-neutral-200" />
      </div>
      <div className="hidden p-4 lg:block">
        <div className="h-full rounded-2xl bg-neutral-200" />
      </div>
    </div>
  );
}
