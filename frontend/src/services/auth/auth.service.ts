import {
  getRefreshToken,
  clearAuthSession,
  getAccessToken,
} from "@/lib/auth/session";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const LOG_PREFIX = "[SheRide][auth]";

let refreshInFlight: Promise<string | null> | null = null;

function logAuth(message: string, data?: unknown) {
  if (process.env.NODE_ENV === "production") return;
  if (data !== undefined) console.info(LOG_PREFIX, message, data);
  else console.info(LOG_PREFIX, message);
}

function logAuthWarn(message: string, data?: unknown) {
  if (process.env.NODE_ENV === "production") return;
  if (data !== undefined) console.warn(LOG_PREFIX, message, data);
  else console.warn(LOG_PREFIX, message);
}

export function decodeTokenExpMs(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

async function doRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    logAuthWarn("refresh skipped — no refresh token");
    return null;
  }

  try {
    logAuth("refresh started");
    const res = await fetch(`${API}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      logAuthWarn("refresh failed", { status: res.status });
      return null;
    }

    const data = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
    };
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    logAuth("refresh succeeded");
    return data.accessToken;
  } catch (err) {
    logAuthWarn("refresh error", err);
    return null;
  }
}

/** Deduplicated refresh — safe for concurrent 401 responses. */
export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export function logout() {
  clearAuthSession();
  window.location.href = "/login?reason=session_expired";
}

/** Schedule proactive refresh ~60s before access token expiry. */
export function scheduleProactiveTokenRefresh(): () => void {
  if (typeof window === "undefined") return () => {};

  let timer: ReturnType<typeof setTimeout> | undefined;

  const run = () => {
    if (timer) clearTimeout(timer);

    const token = getAccessToken();
    const refresh = getRefreshToken();
    if (!token || !refresh) return;

    const expMs = decodeTokenExpMs(token);
    if (!expMs) return;

    const delay = Math.max(expMs - Date.now() - 60_000, 5_000);
    logAuth("proactive refresh scheduled", { delayMs: delay });

    timer = setTimeout(async () => {
      const newToken = await refreshAccessToken();
      if (newToken) run();
    }, delay);
  };

  run();
  return () => {
    if (timer) clearTimeout(timer);
  };
}
