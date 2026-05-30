import { apiFetch } from "@/services/api/api-client";
import { getAccessToken } from "@/lib/auth/session";

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

async function parseJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiRequest(
  path: string,
  body?: unknown,
  token?: string | null,
) {
  const res = await apiFetch(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : getAccessToken()
        ? {}
        : {},
  });

  const data = await parseJson(res);

  if (!res.ok) {
    throw new Error(formatApiError(data ?? {}));
  }

  return data;
}

export async function apiGet(path: string, token?: string | null) {
  const res = await apiFetch(path, {
    method: "GET",
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const data = await parseJson(res);

  if (!res.ok) {
    throw new Error(formatApiError(data ?? {}));
  }

  return data;
}

function formatApiError(data: {
  message?: string | string[] | { message?: string; errors?: Record<string, string[]> };
  errors?: Record<string, string[]>;
}): string {
  if (
    typeof data.message === "object" &&
    data.message !== null &&
    !Array.isArray(data.message)
  ) {
    const nested = data.message as {
      message?: string;
      errors?: Record<string, string[]>;
    };
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
