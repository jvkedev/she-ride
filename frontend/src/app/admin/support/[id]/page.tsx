import Link from "next/link";
import { notFound } from "next/navigation";

import TicketConversation from "@/components/admin/support/ticket-conversation";
import StatusBadge from "@/components/shared/dashboard/status-badge";
import DashboardPageLayout from "@/components/shared/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { adminTickets } from "@/lib/admin/mock-data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminTicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ticket = adminTickets.find((t) => t.id === id);

  if (!ticket) {
    notFound();
  }

  return (
    <DashboardPageLayout
      title={`Ticket ${ticket.id}`}
      description={`${ticket.user} · ${ticket.role}`}
      actions={
        <Button variant="outline" className="rounded-lg" asChild>
          <Link href="/admin/support">All tickets</Link>
        </Button>
      }
    >
      <div className="mb-4">
        <StatusBadge status={ticket.status} />
      </div>
      <TicketConversation ticket={ticket} />
    </DashboardPageLayout>
  );
}
