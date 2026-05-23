import SosMonitoringPanel from "@/components/security/sos/sos-monitoring-panel";

export default function SecuritySosPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-neutral-900">SOS monitoring center</h1>
        <p className="text-sm text-neutral-500">
          Real-time emergency alerts, escalation, and live ride tracking.
        </p>
      </div>
      <SosMonitoringPanel />
    </div>
  );
}
