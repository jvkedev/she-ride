"use client";

import Link from "next/link";
import { useState } from "react";

import SurfaceCard from "@/components/shared/dashboard/surface-card";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateSupportTicket } from "@/services/admin/admin.service";

type SupportTicketDetail = {
  id: string;
  subject: string;
  description: string;
  status: string;
  category: string;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
  rider: { user: { fullName: string; email: string; phoneNumber: string } };
  ride: {
    id: string;
    pickupAddress: string;
    dropAddress: string;
    status: string;
  } | null;
};

type TicketConversationProps = {
  ticket: SupportTicketDetail;
  onUpdated?: (ticket: SupportTicketDetail) => void;
};

export default function TicketConversation({
  ticket,
  onUpdated,
}: TicketConversationProps) {
  const [reply, setReply] = useState(ticket.adminResponse ?? "");
  const [status, setStatus] = useState(ticket.status);
  const [saving, setSaving] = useState(false);

  async function handleSend() {
    setSaving(true);
    try {
      const updated = await updateSupportTicket(ticket.id, {
        adminResponse: reply,
        status: status === "OPEN" ? "IN_PROGRESS" : status,
      });
      onUpdated?.(updated);
      setStatus(updated.status);
      setReply(updated.adminResponse ?? "");
    } catch (error) {
      console.error("Failed to update ticket:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleResolve() {
    setSaving(true);
    try {
      const updated = await updateSupportTicket(ticket.id, {
        status: "RESOLVED",
        adminResponse: reply,
      });
      onUpdated?.(updated);
      setStatus(updated.status);
    } catch (error) {
      console.error("Failed to resolve ticket:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SurfaceCard className="flex min-h-[400px] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">{ticket.subject}</h2>
          <p className="mt-1 text-xs text-neutral-500">
            {ticket.rider.user.fullName} · {ticket.id}
          </p>
        </div>
        <StatusBadge status={status.toLowerCase() as "open"} />
      </div>

      <div className="dashboard-panel-scroll mt-4 flex-1 space-y-3">
        <div className="mr-8 rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-800">
          <p className="text-xs font-medium text-neutral-500">Rider message</p>
          <p className="mt-1">{ticket.description}</p>
          <p className="mt-1 text-[10px] text-neutral-400">
            {new Date(ticket.createdAt).toLocaleString("en-IN")}
          </p>
        </div>

        {ticket.ride && (
          <div className="rounded-lg border border-neutral-100 px-3 py-2 text-xs text-neutral-600">
            Linked ride: {ticket.ride.pickupAddress} → {ticket.ride.dropAddress}
            {ticket.ride.id ? (
              <>
                {" "}
                ·{" "}
                <Link href={`/admin/rides`} className="text-primary hover:underline">
                  View rides
                </Link>
              </>
            ) : null}
          </div>
        )}

        {ticket.adminResponse && (
          <div className="ml-8 rounded-lg bg-primary/10 px-3 py-2 text-sm text-neutral-800">
            <p className="text-xs font-medium text-primary">Admin response</p>
            <p className="mt-1">{ticket.adminResponse}</p>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
        >
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <Textarea
          placeholder="Reply to ticket..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          className="min-h-[80px] rounded-lg"
        />
        <div className="flex gap-2">
          <Button
            className="rounded-lg"
            disabled={saving}
            onClick={handleSend}
          >
            {saving ? "Saving…" : "Send reply"}
          </Button>
          <Button
            variant="outline"
            className="rounded-lg"
            disabled={saving}
            onClick={handleResolve}
          >
            Resolve
          </Button>
        </div>
      </div>
    </SurfaceCard>
  );
}
