"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2, MessageCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import RiderCard from "@/components/rider/shared/rider-card";
import {
  createSupportTicket,
  getMySupportTickets,
  SUPPORT_CATEGORIES,
  type SupportTicket,
  type SupportTicketCategory,
} from "@/services/support/support.service";

const FAQ = [
  {
    q: "How do I cancel a ride?",
    a: "While searching or before pickup, use Cancel ride on the trip or track screen.",
  },
  {
    q: "How is fare calculated?",
    a: "Fare is estimated from distance and vehicle type before you confirm the booking.",
  },
  {
    q: "What if I feel unsafe?",
    a: "Use SOS on the Safety tab or during an active trip. Your live location is shared with support.",
  },
  {
    q: "How do I report a captain?",
    a: "Open ride details from History or use Report captain during or after a trip.",
  },
];

export default function RiderSupportPanel() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [category, setCategory] = useState<SupportTicketCategory>("RIDE_ISSUE");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    getMySupportTickets()
      .then(setTickets)
      .catch(() => setTickets([]))
      .finally(() => setLoadingTickets(false));
  }, []);

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
      const ticket = await createSupportTicket({
        category,
        subject: subject.trim(),
        description: description.trim(),
      });
      setTickets((prev) => [ticket, ...prev]);
      setSubject("");
      setDescription("");
      setMessage("Ticket submitted. We'll respond soon.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <RiderCard>
        <h2 className="text-sm font-semibold text-neutral-900">FAQ</h2>
        <ul className="mt-4 divide-y divide-neutral-100">
          {FAQ.map((item, index) => (
            <li key={item.q}>
              <button
                type="button"
                className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-neutral-900"
                onClick={() =>
                  setOpenFaq(openFaq === index ? null : index)
                }
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
      </RiderCard>

      <RiderCard>
        <h2 className="text-sm font-semibold text-neutral-900">
          Submit a ticket
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Ride issues, payments, safety, and account help.
        </p>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3">
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as SupportTicketCategory)
            }
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          >
            {SUPPORT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
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
            Submit ticket
          </Button>
        </form>
      </RiderCard>

      <RiderCard>
        <div className="flex items-center gap-2">
          <MessageCircle className="size-4 text-neutral-600" />
          <h2 className="text-sm font-semibold text-neutral-900">
            Your tickets
          </h2>
        </div>
        {loadingTickets ? (
          <p className="mt-4 text-sm text-neutral-400">Loading...</p>
        ) : tickets.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">No tickets yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {tickets.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-neutral-100 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-900">
                    {t.subject}
                  </p>
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                    {t.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                  {t.description}
                </p>
                <p className="mt-2 text-xs text-neutral-400">
                  {new Date(t.createdAt).toLocaleDateString("en-IN")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </RiderCard>

      <RiderCard>
        <p className="text-sm text-neutral-600">
          Urgent safety issue during a trip? Use SOS on the Safety page or the
          track ride screen.
        </p>
        <Button variant="outline" className="mt-4 w-full" asChild>
          <a href="tel:112">Emergency: 112</a>
        </Button>
      </RiderCard>
    </div>
  );
}
