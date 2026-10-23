/** Home page for each role's portal — the single source for "Dashboard" links. */
export function dashboardPath(role: string | null | undefined): string | null {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "vendor":
      return "/vendor/dashboard";
    case "mechanic":
      return "/mechanic/dashboard";
    case "customer":
      return "/acquisitions";
    default:
      return null;
  }
}

/**
 * Only allow same-site relative paths as post-login redirects, so a crafted
 * `?returnTo=https://evil.example` can't bounce users off-site.
 */
export function safeReturnTo(value: string | null | undefined, fallback = "/shop"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
