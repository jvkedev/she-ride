import SurveillancePanel from "@/components/security/surveillance/surveillance-panel";

export default function SecuritySurveillancePage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-neutral-900">Live ride surveillance</h1>
        <p className="text-sm text-neutral-500">
          Route deviation, suspicious stops, and movement tracking.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <SurveillancePanel />
      </div>
    </div>
  );
}
