import { MessageCircle, Navigation, Phone } from "lucide-react";

import CaptainActionButton from "@/components/captain/shared/captain-action-button";
import { Button } from "@/components/ui/button";

export default function RideControls() {
  return (
    <div className="space-y-3">
      <CaptainActionButton fullWidth className="gap-2">
        <Navigation className="size-4" />
        Navigate to destination
      </CaptainActionButton>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-11 rounded-lg gap-2">
          <Phone className="size-4" />
          Call
        </Button>
        <Button variant="outline" className="h-11 rounded-lg gap-2">
          <MessageCircle className="size-4" />
          Message
        </Button>
      </div>
      <CaptainActionButton variant="outline" fullWidth className="border-neutral-300">
        End trip
      </CaptainActionButton>
    </div>
  );
}
