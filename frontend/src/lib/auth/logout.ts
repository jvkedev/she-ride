const AUTH_STORAGE_KEYS = [
  "accessToken",
  "user",
  "authFlow",
  "authPhoneNumber",
  "roleSelectionGranted",
] as const;

/** Clears client auth session data from localStorage. */
export function clearAuthSession(): void {
  if (typeof window === "undefined") return;

  for (const key of AUTH_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}
