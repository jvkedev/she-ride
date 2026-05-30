import { getAccessToken } from "@/lib/auth/session";
import { refreshAccessToken, logout } from "@/services/auth/auth.service";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type FetchOptions = RequestInit & { _retry?: boolean };

export async function apiFetch(
  path: string,
  options: FetchOptions = {},
): Promise<Response> {
  const token = getAccessToken();

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && !options._retry) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      logout();
      return res;
    }

    return apiFetch(path, {
      ...options,
      _retry: true,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      },
    });
  }

  return res;
}
