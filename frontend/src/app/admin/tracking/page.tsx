import LiveTrackingPanel from "@/components/admin/tracking/live-tracking-panel";

export default function AdminTrackingPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-neutral-900">Live tracking</h1>
        <p className="text-sm text-neutral-500">
          Real-time fleet map with active rides and captain locations.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <LiveTrackingPanel />
      </div>
    </div>
  );
}
