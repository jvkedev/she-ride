import { apiFetch } from "@/services/api/api-client";

export type PaymentMethod = "CASH" | "UPI" | "CARD";

export interface PaymentHistoryItem {
  id: string;
  route: string;
  pickupAddress: string;
  dropAddress: string;
  fare: number;
  method: PaymentMethod;
  status: "PAID" | "PENDING";
  completedAt: string;
}

export interface PaymentHistoryResponse {
  data: PaymentHistoryItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export async function getDefaultPaymentMethod(): Promise<{
  method: PaymentMethod;
}> {
  const res = await apiFetch("/rider/payments/default-method");
  if (!res.ok) throw new Error("Failed to load payment method");
  return res.json();
}

export async function setDefaultPaymentMethod(
  method: PaymentMethod,
): Promise<{ method: PaymentMethod }> {
  const res = await apiFetch("/rider/payments/default-method", {
    method: "PATCH",
    body: JSON.stringify({ method }),
  });
  if (!res.ok) throw new Error("Failed to update payment method");
  return res.json();
}

export async function getPaymentHistory(
  page = 1,
  limit = 10,
): Promise<PaymentHistoryResponse> {
  const res = await apiFetch(
    `/rider/payments/history?page=${page}&limit=${limit}`,
  );
  if (!res.ok) throw new Error("Failed to load payment history");
  return res.json();
}

export async function getLastReceipt() {
  const res = await apiFetch("/rider/payments/last-receipt");
  if (!res.ok) throw new Error("Failed to load receipt");
  const data = await res.json();
  return data ?? null;
}
