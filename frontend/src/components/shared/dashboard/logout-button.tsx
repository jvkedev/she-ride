"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clearAuthSession } from "@/lib/auth/logout";
import { cn } from "@/lib/utils";

type DashboardLogoutButtonProps = {
  className?: string;
  onLoggedOut?: () => void;
};

export default function DashboardLogoutButton({
  className,
  onLoggedOut,
}: DashboardLogoutButtonProps) {
  const router = useRouter();

  function handleLogout() {
    clearAuthSession();
    onLoggedOut?.();
    router.push("/login");
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      className={cn(
        "h-9 w-full gap-2 rounded-lg border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900",
        className,
      )}
    >
      <LogOut className="size-4 shrink-0" />
      Log out
    </Button>
  );
}
