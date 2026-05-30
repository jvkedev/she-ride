"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Car, UserRound } from "lucide-react";

import { apiRequest } from "@/lib/api";
import {
  clearRoleSelectionGrant,
  setAuthSession,
  type AuthUser,
} from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppRole = "RIDER" | "CAPTAIN";

const roleOptions: {
  role: AppRole;
  title: string;
  description: string;
  icon: typeof UserRound;
}[] = [
  {
    role: "RIDER",
    title: "Continue as Rider",
    description: "Book safe rides, track trips, and manage payments.",
    icon: UserRound,
  },
  {
    role: "CAPTAIN",
    title: "Continue as Captain",
    description: "Accept ride requests, earn, and manage your vehicle.",
    icon: Car,
  },
];

export default function SelectRoleForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<AppRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!selected) {
      setError("Please select how you want to use She Ride.");
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    if (!token) {
      router.replace("/login");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiRequest("/auth/select-role", { role: selected }, token);

      if (res.accessToken && res.user) {
        setAuthSession(res.accessToken, res.user as AuthUser, {
          refreshToken: res.refreshToken,
        });
        clearRoleSelectionGrant();
      }

      router.replace(res.redirectTo ?? (selected === "RIDER" ? "/rider" : "/captain"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your role.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:py-14">
      <div className="mb-8 text-center">
        <Image
          src="/logos/logo.png"
          alt="She Ride"
          width={56}
          height={56}
          className="mx-auto rounded-lg"
        />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900">
          How will you use She Ride?
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Choose once to set up your account. This cannot be changed later from this
          screen.
        </p>
      </div>

      <div className="space-y-3">
        {roleOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.role;

          return (
            <button
              key={option.role}
              type="button"
              onClick={() => {
                setSelected(option.role);
                setError(null);
              }}
              className={cn(
                "flex w-full items-start gap-4 rounded-xl border-2 bg-white p-4 text-left transition",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50",
              )}
            >
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-xl",
                  isSelected ? "bg-primary text-white" : "bg-neutral-100 text-neutral-600",
                )}
              >
                <Icon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-900">{option.title}</p>
                <p className="mt-1 text-sm text-neutral-500">{option.description}</p>
              </div>
              <span
                className={cn(
                  "mt-1 size-5 shrink-0 rounded-full border-2",
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-neutral-300 bg-white",
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <Button
        type="button"
        disabled={!selected || isSubmitting}
        onClick={handleContinue}
        className="mt-6 h-11 w-full rounded-lg font-semibold"
      >
        {isSubmitting ? "Setting up your account..." : "Continue"}
      </Button>
    </div>
  );
}
