import { Globe, MapPin, Smartphone, Users } from "lucide-react";

import StatWidget from "@/components/shared/dashboard/stat-widget";

export default function FraudRiskCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatWidget label="GPS spoofing (24h)" value="4" icon={MapPin} accent="primary" />
      <StatWidget label="Multi-account flags" value="2" icon={Users} />
      <StatWidget label="Payment fraud" value="3" icon={Smartphone} />
      <StatWidget label="VPN / proxy logins" value="7" icon={Globe} />
    </div>
  );
}
