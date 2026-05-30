"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import TicketConversation from "@/components/admin/support/ticket-conversation";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { fetchSupportTicket } from "@/services/admin/admin.service";

export default function AdminTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [ticket, setTicket] = useState<Awaited<
    ReturnType<typeof fetchSupportTicket>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSupportTicket(id);
      setTicket(data);
    } catch {
      setError("Ticket not found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <DashboardPageLayout title="Support ticket">
        <div className="flex items-center gap-2 text-neutral-500">
          <Loader2 className="size-5 animate-spin" />
          Loading ticket…
        </div>
      </DashboardPageLayout>
    );
  }

  if (error || !ticket) {
    return (
      <DashboardPageLayout
        title="Support ticket"
        actions={
          <Button variant="outline" className="rounded-lg" asChild>
            <Link href="/admin/support">All tickets</Link>
          </Button>
        }
      >
        <p className="text-sm text-red-600">{error ?? "Not found"}</p>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout
      title={`Ticket ${ticket.id.slice(0, 8)}…`}
      description={`${ticket.rider.user.fullName} · ${ticket.category.replace(/_/g, " ")}`}
      actions={
        <Button variant="outline" className="rounded-lg" asChild>
          <Link href="/admin/support">All tickets</Link>
        </Button>
      }
    >
      <TicketConversation ticket={ticket} onUpdated={setTicket} />
    </DashboardPageLayout>
  );
}
