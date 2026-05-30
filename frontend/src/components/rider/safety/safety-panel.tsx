"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Phone, ShieldAlert, ShieldCheck } from "lucide-react";

import SosTriggerButton from "@/components/shared/safety/sos-trigger-button";
import { getRiderActiveRide } from "@/services/rides/rides.service";
import { getRiderProfile } from "@/services/profile/profile.service";

const tips = [
  "Share your trip with a trusted contact before every ride.",
  "Verify the driver and vehicle details before getting in.",
  "Use in-app SOS if you feel unsafe during a trip.",
];

export default function SafetyPanel() {
  const [rideId, setRideId] = useState<string | undefined>();
  const [contactName, setContactName] = useState<string | null>(null);
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRiderProfile().catch(() => null),
      getRiderActiveRide().catch(() => null),
    ]).then(([profile, active]) => {
      if (profile?.emergencyContactName) {
        setContactName(profile.emergencyContactName);
      }
      if (profile?.emergencyContactPhone) {
        setContactPhone(profile.emergencyContactPhone);
      }
      if (active?.rideId) setRideId(active.rideId);
    }).finally(() => setLoading(false));
  }, []);

  const contacts =
    contactName && contactPhone
      ? [{ name: contactName, phone: contactPhone }]
      : [];

  return (
    <>
      <section className="rounded-xl border border-red-100 bg-red-50/50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="size-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-neutral-900">Emergency SOS</h2>
            <p className="text-sm text-neutral-600">
              Alerts support with your live GPS
              {rideId ? " for your active trip" : ""}
            </p>
          </div>
        </div>
        <SosTriggerButton className="mt-4" rideId={rideId} />
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            Emergency contacts
          </h2>
          <Link
            href="/rider/profile"
            className="text-xs font-medium text-primary hover:underline"
          >
            Edit
          </Link>
        </div>
        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
            <Loader2 className="size-4 animate-spin" />
            Loading...
          </div>
        ) : contacts.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">
            Add an emergency contact in your{" "}
            <Link href="/rider/profile" className="text-primary underline">
              profile
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {contacts.map((contact) => (
              <li
                key={contact.phone}
                className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {contact.name}
                  </p>
                  <p className="text-xs text-neutral-500">{contact.phone}</p>
                </div>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  aria-label={`Call ${contact.name}`}
                  className="rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100"
                >
                  <Phone className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="size-4 text-neutral-600" />
          <h2 className="text-sm font-semibold text-neutral-900">Safety tips</h2>
        </div>
        <ul className="list-disc space-y-2 pl-5">
          {tips.map((tip) => (
            <li key={tip} className="text-sm leading-relaxed text-neutral-600">
              {tip}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
