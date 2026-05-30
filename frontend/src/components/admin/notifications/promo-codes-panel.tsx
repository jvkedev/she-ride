import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { Button } from "@/components/ui/button";
import { dashboardHeading } from "@/lib/dashboard/styles";

export default function PromoCodesPanel() {
  return (
    <SurfaceCard>
      <div className="flex items-center justify-between">
        <h2 className={dashboardHeading}>Promo codes</h2>
        <Button size="sm" className="rounded-lg" disabled>
          Create promo
        </Button>
      </div>
      <p className="mt-4 text-sm text-neutral-500">
        No promo campaigns yet. Create one when the promotions API is enabled.
      </p>
    </SurfaceCard>
  );
}
