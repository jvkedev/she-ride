/** Route prefixes that use dashboard shell (sidebar + header), not site navbar/footer. */
export const DASHBOARD_ROUTE_PREFIXES = [
  "/rider",
  "/captain",
  "/admin",
  "/security",
] as const;

export function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Auth flows without marketing navbar/footer (login, register, role selection). */
export const AUTH_ONLY_ROUTES = [
  "/login",
  "/signup",
  "/verify-otp",
  "/select-role",
] as const;

export function isAuthOnlyRoute(pathname: string): boolean {
  return AUTH_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
