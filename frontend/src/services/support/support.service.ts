import { apiFetch } from "@/services/api/api-client";

export const SUPPORT_CATEGORIES = [
  { value: "RIDE_ISSUE", label: "Ride issue" },
  { value: "PAYMENT", label: "Payment" },
  { value: "SAFETY", label: "Safety" },
  { value: "ACCOUNT", label: "Account" },
  { value: "APP_BUG", label: "App bug" },
  { value: "OTHER", label: "Other" },
] as const;

export type SupportTicketCategory =
  (typeof SUPPORT_CATEGORIES)[number]["value"];

export interface SupportTicket {
  id: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  rideId: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function createSupportTicket(payload: {
  category: SupportTicketCategory;
  subject: string;
  description: string;
  rideId?: string;
}): Promise<SupportTicket> {
  const res = await apiFetch("/support/tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message || "Failed to create ticket");
  }
  return body;
}

export async function getMySupportTickets(): Promise<SupportTicket[]> {
  const res = await apiFetch("/support/tickets");
  if (!res.ok) throw new Error("Failed to load tickets");
  return res.json();
}

export async function getSupportTicket(id: string): Promise<SupportTicket> {
  const res = await apiFetch(`/support/tickets/${id}`);
  if (!res.ok) throw new Error("Ticket not found");
  return res.json();
}
