import SurfaceCard from "@/components/shared/dashboard/surface-card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { AdminTicket } from "@/lib/admin/types";

const messages = [
  { from: "user", text: "The driver has not arrived after 15 minutes.", time: "10:02 AM" },
  { from: "admin", text: "We are contacting the captain. Please stay on the line.", time: "10:05 AM" },
  { from: "user", text: "Driver just arrived. Thank you.", time: "10:12 AM" },
];

type TicketConversationProps = {
  ticket: AdminTicket;
};

export default function TicketConversation({ ticket }: TicketConversationProps) {
  return (
    <SurfaceCard className="flex min-h-[400px] flex-col">
      <h2 className="text-sm font-semibold text-neutral-900">{ticket.subject}</h2>
      <p className="mt-1 text-xs text-neutral-500">
        {ticket.user} · {ticket.id}
      </p>
      <div className="dashboard-panel-scroll mt-4 flex-1 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.from === "admin"
                ? "ml-8 rounded-lg bg-primary/10 px-3 py-2 text-sm text-neutral-800"
                : "mr-8 rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-800"
            }
          >
            <p>{msg.text}</p>
            <p className="mt-1 text-[10px] text-neutral-400">{msg.time}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2 border-t border-neutral-100 pt-4">
        <Textarea placeholder="Reply to ticket..." className="min-h-[80px] rounded-lg" />
        <Button className="shrink-0 self-end rounded-lg">Send</Button>
      </div>
    </SurfaceCard>
  );
}
