/** Security API + WebSocket endpoints — connect when backend is ready. */

export const SECURITY_WS_URL =
  process.env.NEXT_PUBLIC_SECURITY_WS_URL ?? "wss://api.sheride.local/security/live";

export async function fetchSecurityOverview() {
  return null;
}

export async function fetchSosAlerts() {
  return null;
}
