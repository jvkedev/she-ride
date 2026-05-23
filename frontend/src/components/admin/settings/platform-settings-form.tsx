import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { dashboardHeading } from "@/lib/dashboard/styles";

export default function PlatformSettingsForm() {
  return (
    <SurfaceCard>
      <h2 className={dashboardHeading}>Platform settings</h2>
      <form className="mt-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-neutral-600">Platform name</label>
          <Input defaultValue="She Ride" className="mt-1 h-10 rounded-lg bg-[#eeeeee]" />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Support email</label>
          <Input defaultValue="support@sheride.com" className="mt-1 h-10 rounded-lg bg-[#eeeeee]" />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Emergency hotline</label>
          <Input defaultValue="+91 1800-XXX-XXXX" className="mt-1 h-10 rounded-lg bg-[#eeeeee]" />
        </div>
        <Button className="rounded-lg">Save changes</Button>
      </form>
    </SurfaceCard>
  );
}
