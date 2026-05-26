export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "PENDING" | "RIDER" | "CAPTAIN" | "ADMIN" | "SECURITY";
  accountStatus?: string;
  isPhoneVerified?: boolean;
  onboardingStatus?: string;
};

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";
const ROLE_SELECTION_GRANT_KEY = "roleSelectionGranted";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthSession(
  accessToken: string,
  user: AuthUser,
  options?: { grantRoleSelection?: boolean; refreshToken?: string }, // ← add refreshToken
) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  if (options?.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, options.refreshToken); // ← save it
  }

  if (options?.grantRoleSelection) {
    localStorage.setItem(ROLE_SELECTION_GRANT_KEY, "1");
  }
}

export function clearRoleSelectionGrant() {
  localStorage.removeItem(ROLE_SELECTION_GRANT_KEY);
}

export function hasRoleSelectionGrant(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ROLE_SELECTION_GRANT_KEY) === "1";
}

export function isRolePending(user: AuthUser | null): boolean {
  return user?.role === "PENDING";
}

export function getDashboardPathForRole(role: AuthUser["role"]): string {
  switch (role) {
    case "RIDER":
      return "/rider";
    case "CAPTAIN":
      return "/captain";
    case "ADMIN":
      return "/admin";
    case "SECURITY":
      return "/security";
    default:
      return "/login";
  }
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_SELECTION_GRANT_KEY);
}
