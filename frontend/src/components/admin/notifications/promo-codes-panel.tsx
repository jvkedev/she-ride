import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { dashboardHeading } from "@/lib/dashboard/styles";
import { promoCampaigns } from "@/lib/admin/mock-data";

export default function PromoCodesPanel() {
  return (
    <SurfaceCard>
      <div className="flex items-center justify-between">
        <h2 className={dashboardHeading}>Promo codes</h2>
        <Button size="sm" className="rounded-lg">
          Create promo
        </Button>
      </div>
      <ul className="mt-4 space-y-3">
        {promoCampaigns.map((promo) => (
          <li
            key={promo.id}
            className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-3"
          >
            <div>
              <p className="font-mono text-sm font-semibold text-neutral-900">
                {promo.code}
              </p>
              <p className="text-xs text-neutral-500">
                {promo.discount} · {promo.usage} uses
              </p>
            </div>
            <StatusBadge status="active" />
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}
