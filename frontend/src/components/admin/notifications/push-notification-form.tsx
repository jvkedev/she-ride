"use client";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dashboardHeading } from "@/lib/dashboard/styles";

export default function PushNotificationForm() {
  return (
    <SurfaceCard>
      <h2 className={dashboardHeading}>Send push notification</h2>
      <form className="mt-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="text-xs font-medium text-neutral-600">Audience</label>
          <Select defaultValue="all-riders">
            <SelectTrigger className="mt-1 h-10 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-riders">All riders</SelectItem>
              <SelectItem value="all-drivers">All captains</SelectItem>
              <SelectItem value="city">By city</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Title</label>
          <Input className="mt-1 h-10 rounded-lg bg-[#eeeeee]" placeholder="Notification title" />
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-600">Message</label>
          <Textarea
            className="mt-1 rounded-lg bg-[#eeeeee]"
            placeholder="Write your message..."
            rows={4}
          />
        </div>
        <Button type="submit" className="h-11 w-full rounded-lg font-semibold">
          Send notification
        </Button>
      </form>
    </SurfaceCard>
  );
}
