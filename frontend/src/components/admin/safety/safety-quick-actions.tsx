import { Phone, ShieldAlert, MapPin } from "lucide-react";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { Button } from "@/components/ui/button";
import { dashboardHeading } from "@/lib/dashboard/styles";

const actions = [
  { icon: ShieldAlert, label: "Broadcast SOS alert", variant: "destructive" as const },
  { icon: Phone, label: "Call emergency contact", variant: "outline" as const },
  { icon: MapPin, label: "Open live tracking", variant: "outline" as const },
];

export default function SafetyQuickActions() {
  return (
    <SurfaceCard>
      <h2 className={dashboardHeading}>Quick actions</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant={action.variant}
              className="h-11 justify-start gap-2 rounded-lg"
            >
              <Icon className="size-4" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
