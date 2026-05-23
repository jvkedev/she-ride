const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export async function apiRequest(path: string, body?: unknown, token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(formatApiError(data));
  }

  return data;
}

export async function apiGet(path: string, token?: string | null) {
  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(formatApiError(data));
  }

  return data;
}

function formatApiError(data: {
  message?: string | string[] | { message?: string; errors?: Record<string, string[]> };
  errors?: Record<string, string[]>;
}): string {
  if (typeof data.message === "object" && data.message !== null && !Array.isArray(data.message)) {
    const nested = data.message as { message?: string; errors?: Record<string, string[]> };
    const fieldMessages = nested.errors
      ? Object.values(nested.errors).flat().join(", ")
      : "";
    return fieldMessages || nested.message || "Request failed";
  }

  if (data.errors) {
    const fieldMessages = Object.values(data.errors).flat().join(", ");
    if (fieldMessages) return fieldMessages;
  }

  if (Array.isArray(data.message)) {
    return data.message.join(", ");
  }

  return typeof data.message === "string" ? data.message : "Request failed";
}
