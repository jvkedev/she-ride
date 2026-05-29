"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { clearAuthSession } from "@/lib/auth/logout";
import { getRiderProfile } from "@/services/profile/profile.service";

export default function SettingsPanel() {
  const router = useRouter();
  const [contactName, setContactName] = useState<string>("Not set");
  const [contactPhone, setContactPhone] = useState<string>("Not set");
  const [rideUpdates, setRideUpdates] = useState(true);
  const [safetyAlerts, setSafetyAlerts] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRiderProfile()
      .then((profile) => {
        if (profile.emergencyContactName) {
          setContactName(profile.emergencyContactName);
        }
        if (profile.emergencyContactPhone) {
          setContactPhone(profile.emergencyContactPhone);
        }
      })
      .catch(() => {
        setContactName("Not set");
        setContactPhone("Not set");
      })
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    clearAuthSession();
    router.push("/login");
  }

  function handleUpdateContact() {
    router.push("/rider/profile");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="gap-2">
          <CardTitle>Emergency contact</CardTitle>
          <CardDescription>
            Keep one trusted contact ready in case of an urgent safety need.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                Contact name
              </p>
              <p className="mt-2 text-sm font-medium text-neutral-900">
                {loading ? "Loading..." : contactName}
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                Phone number
              </p>
              <p className="mt-2 text-sm font-medium text-neutral-900">
                {loading ? "Loading..." : contactPhone}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUpdateContact}
            >
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-2">
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose the alerts you want to receive from She Ride.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm">
            <div>
              <p className="text-sm font-medium text-neutral-900">
                Ride updates
              </p>
              <p className="text-xs text-neutral-500">
                Receive status updates about your rides.
              </p>
            </div>
            <button
              type="button"
              aria-pressed={rideUpdates}
              onClick={() => setRideUpdates((current) => !current)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                rideUpdates ? "bg-primary" : "bg-neutral-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  rideUpdates ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm">
            <div>
              <p className="text-sm font-medium text-neutral-900">
                Safety alerts
              </p>
              <p className="text-xs text-neutral-500">
                Get notified for safety-related events and warnings.
              </p>
            </div>
            <button
              type="button"
              aria-pressed={safetyAlerts}
              onClick={() => setSafetyAlerts((current) => !current)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                safetyAlerts ? "bg-primary" : "bg-neutral-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  safetyAlerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-neutral-900">Logout</p>
            <p className="mt-1 text-sm text-neutral-500">
              Sign out and return to the login screen.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
