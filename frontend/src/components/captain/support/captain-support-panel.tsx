"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2, Send } from "lucide-react";

import CaptainCard from "@/components/captain/shared/captain-card";
import { Button } from "@/components/ui/button";
import { captainHeading } from "@/lib/captain/captain-styles";
import { apiFetch } from "@/services/api/api-client";

const FAQ = [
  {
    q: "How do I accept a ride?",
    a: "Stay online and tap Accept on an incoming request. You'll be navigated to pickup automatically.",
  },
  {
    q: "What if a rider cancels?",
    a: "Your dashboard updates automatically. Return online to receive new requests.",
  },
  {
    q: "How are earnings calculated?",
    a: "Completed trip fares appear in Earnings after you mark the ride complete.",
  },
];

export default function CaptainSupportPanel() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError("Subject and description are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch("/captain/support/inquiry", {
        method: "POST",
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
          category: "OTHER",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to submit");
      }
      setSubject("");
      setDescription("");
      setMessage("Support request submitted. Our team will respond soon.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <CaptainCard>
        <h2 className={captainHeading}>FAQ</h2>
        <ul className="mt-4 divide-y divide-neutral-100">
          {FAQ.map((item, index) => (
            <li key={item.q}>
              <button
                type="button"
                className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-neutral-900"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                {item.q}
                <ChevronDown
                  className={`size-4 shrink-0 transition ${
                    openFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === index && (
                <p className="pb-3 text-sm text-neutral-600">{item.a}</p>
              )}
            </li>
          ))}
        </ul>
      </CaptainCard>

      <CaptainCard>
        <h2 className={captainHeading}>Contact support</h2>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          <textarea
            rows={4}
            placeholder="Describe your issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          {message && (
            <p className="text-xs font-medium text-emerald-700">{message}</p>
          )}
          <Button type="submit" className="w-full gap-2" disabled={submitting}>
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Submit request
          </Button>
        </form>
      </CaptainCard>
    </div>
  );
}
