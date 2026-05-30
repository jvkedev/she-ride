"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import PendingRoleGuard from "@/components/auth/pending-role-guard";
import CaptainHeader from "@/components/captain/layout/captain-header";
import CaptainMobileNav from "@/components/captain/layout/captain-mobile-nav";
import CaptainRoutePrefetch from "@/components/captain/layout/captain-route-prefetch";
import CaptainSidebar from "@/components/captain/layout/captain-sidebar";
import {
  useCaptainProfile,
  useInvalidateCaptainProfile,
} from "@/hooks/captain/use-captain-profile";
import { useInvalidateCaptainDocuments } from "@/hooks/captain/use-captain-documents";
import { setCaptainOnline } from "@/services/captain/captain-profile.service";
import { getCaptainActiveRide } from "@/services/captain/captain-rides.service";
import {
  connectSocket,
  subscribeCaptainVerification,
} from "@/services/socket/socket.service";
import { useCaptainStore } from "@/store/captain.store";
import { cn } from "@/lib/utils";

const MAP_LAYOUT_ROUTES = ["/captain", "/captain/active-ride"];

type CaptainLayoutShellProps = {
  children: React.ReactNode;
};

export default function CaptainLayoutShell({
  children,
}: CaptainLayoutShellProps) {
  const [isOnline, setIsOnline] = useState(false);
  const pathname = usePathname();
  const isMapLayout = MAP_LAYOUT_ROUTES.includes(pathname);
  const { setActiveRide, clearActiveRide } = useCaptainStore();
  const { data: profile } = useCaptainProfile();
  const invalidateProfile = useInvalidateCaptainProfile();
  const invalidateDocuments = useInvalidateCaptainDocuments();

  const hydrateActiveRide = useCallback(async () => {
    try {
      const active = await getCaptainActiveRide();
      if (!active) {
        clearActiveRide();
        return;
      }
      setActiveRide({
        rideId: active.rideId,
        status: active.status,
        pickupLat: active.pickupLatitude,
        pickupLng: active.pickupLongitude,
        dropLat: active.dropLatitude,
        dropLng: active.dropLongitude,
        vehicleType: active.vehicleType,
        pickupAddress: active.pickupAddress,
        dropAddress: active.dropAddress,
      });
    } catch {
      /* no active ride */
    }
  }, [clearActiveRide, setActiveRide]);

  useEffect(() => {
    if (profile?.isOnline !== undefined) {
      setIsOnline(profile.isOnline);
    }
  }, [profile?.isOnline]);

  useEffect(() => {
    void hydrateActiveRide();
  }, [hydrateActiveRide]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    let userId: string | null = null;
    try {
      userId = JSON.parse(atob(token.split(".")[1])).sub;
    } catch {
      userId = null;
    }

    if (!userId) return;

    connectSocket(userId, {
      role: "CAPTAIN",
      vehicleType: profile?.vehicleType ?? undefined,
    });

    const unsubscribe = subscribeCaptainVerification((payload) => {
      void invalidateProfile();
      void invalidateDocuments();

      if (payload.message) {
        if (payload.event === "approved") {
          toast.success(payload.message);
        } else if (payload.event === "rejected") {
          toast.error(payload.message);
        } else {
          toast.message(payload.message);
        }
      }
    });

    return unsubscribe;
  }, [invalidateDocuments, invalidateProfile, profile?.vehicleType]);

  const handleOnlineChange = useCallback(async (online: boolean) => {
    setIsOnline(online);
    try {
      await setCaptainOnline(online);
    } catch (error) {
      setIsOnline(!online);
      toast.error(
        error instanceof Error
          ? error.message
          : "Your documents are still pending verification. Please wait for approval before going online.",
      );
    }
  }, []);

  return (
    <PendingRoleGuard>
      <div className="dashboard-viewport-lock flex h-dvh max-h-dvh min-h-0 overflow-hidden bg-[#f6f6f6]">
        <CaptainRoutePrefetch />
        <CaptainSidebar isOnline={isOnline} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <CaptainHeader
            isOnline={isOnline}
            onOnlineChange={handleOnlineChange}
            canGoOnline={profile?.isVerified ?? false}
          />
          <main
            className={cn(
              "min-h-0 flex-1 pb-16 lg:pb-0",
              isMapLayout
                ? "flex flex-col overflow-hidden"
                : "overflow-y-auto",
            )}
          >
            {children}
          </main>
        </div>
        <CaptainMobileNav />
      </div>
    </PendingRoleGuard>
  );
}
