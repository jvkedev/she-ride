import { Phone, ShieldAlert, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

const contacts = [
  { name: "Mom", phone: "+91 98765 43210" },
  { name: "Emergency contact", phone: "+91 91234 56789" },
];

const tips = [
  "Share your trip with a trusted contact before every ride.",
  "Verify the driver and vehicle details before getting in.",
  "Use in-app SOS if you feel unsafe during a trip.",
];

export default function SafetyPanel() {
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
              Instantly alert emergency contacts and support
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          className="mt-4 h-11 w-full rounded-lg font-semibold"
        >
          Trigger SOS
        </Button>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-neutral-900">
          Emergency contacts
        </h2>
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
              <button
                type="button"
                aria-label={`Call ${contact.name}`}
                className="rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100"
              >
                <Phone className="size-4" />
              </button>
            </li>
          ))}
        </ul>
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
